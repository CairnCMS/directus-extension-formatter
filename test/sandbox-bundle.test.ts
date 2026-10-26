import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ivm from 'isolated-vm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { transportFieldName } from '../src/lib/transport.js';

const DIRECTUS_SANDBOX_TIMEOUT_MS = 1000;
const DIRECTUS_SANDBOX_MEMORY_MB = 100;

const bundlePath = fileURLToPath(new URL('../dist/api.js', import.meta.url));

let isolate: ivm.Isolate;
let handler: ivm.Reference;

beforeAll(() => {
	if (!existsSync(bundlePath)) {
		throw new Error('dist/api.js is missing. Run npm run build before the tests.');
	}

	isolate = new ivm.Isolate({ memoryLimit: DIRECTUS_SANDBOX_MEMORY_MB });
	const context = isolate.createContextSync();
	const module = isolate.compileModuleSync(readFileSync(bundlePath, 'utf8'), { filename: 'file:///dist/api.js' });

	module.instantiateSync(context, (specifier) => {
		throw new Error(`the bundle imports ${specifier}`);
	});

	module.evaluateSync({ timeout: DIRECTUS_SANDBOX_TIMEOUT_MS });
	handler = module.namespace.getSync('default', { reference: true }).getSync('handler', { reference: true });
});

afterAll(() => {
	isolate?.dispose();
});

async function run(options: Record<string, unknown>): Promise<unknown> {
	const result = await handler.apply(undefined, [options], {
		arguments: { copy: true },
		result: { reference: true, promise: true },
		timeout: DIRECTUS_SANDBOX_TIMEOUT_MS,
	});

	return result.copy();
}

async function rejectionOf(options: Record<string, unknown>): Promise<unknown> {
	try {
		await run(options);
	} catch (error) {
		return error;
	}

	throw new Error('expected a rejection');
}

function value(transform: string, input: unknown, options: Record<string, unknown> = {}): Record<string, unknown> {
	const transformOptions = Object.fromEntries(
		Object.entries(options).map(([key, option]) => [transportFieldName(transform, key), option])
	);

	return { mode: 'value', transform, value: input, ...transformOptions };
}

function spaces(result: unknown): unknown {
	return typeof result === 'string' ? result.replace(/\p{Zs}/gu, ' ') : result;
}

describe('the built server bundle in an isolate', () => {
	it('imports nothing', () => {
		const code = readFileSync(bundlePath, 'utf8');
		expect(code).not.toMatch(/(^|[;}\s])import\s*[{*"'\w]/);
		expect(code).not.toMatch(/\bimport\s*\(/);
	});

	it.each([
		['Text: Trim with collapse', value('text.trim', '  Hello   World  ', { collapse: true }), 'Hello World'],
		['Text: Slugify', value('text.slugify', 'Hello World!'), 'hello-world'],
		['Phone: Format', value('phone.format', '2015550123', { region: 'US' }), '+12015550123'],
		['Number: Round', value('number.round', '1.005', { scale: 2 }), '1.01'],
		[
			'Number: Format as currency',
			value('number.format', 75, { locale: 'en-US', style: 'currency', currency: 'USD' }),
			'$75.00',
		],
		[
			'Date: Format an instant',
			value('date.format', '2024-01-15T17:30:00Z', {
				inputKind: 'instant',
				locale: 'en-US',
				timeZone: 'America/New_York',
				dateStyle: 'long',
				timeStyle: 'short',
			}),
			'January 15, 2024 at 12:30 PM',
		],
		[
			'Date: Convert an instant',
			value('date.parse', '2024-03-10T07:00:00-05:00', { inputKind: 'instant' }),
			'2024-03-10T12:00:00.000Z',
		],
		['Locale: List', value('locale.list', ['red', 'green', 'blue'], { locale: 'en-US' }), 'red, green, and blue'],
		[
			'Locale: Plural',
			value('locale.plural', 3, { locale: 'en', type: 'ordinal', one: 'st', two: 'nd', few: 'rd', other: 'th' }),
			'rd',
		],
		['Lookup: Table', value('lookup.table', 'us', { table: [{ key: 'us', value: 'United States' }] }), 'United States'],
	])('%s', async (_name, options, expected) => {
		expect(spaces(await run(options))).toEqual(expected);
	});

	it('formats fields in structured mode', async () => {
		const result = await run({
			mode: 'structured',
			source: { name: '  Ada   Lovelace ', email: 'ADA@Example.COM', phone: '2015550123' },
			rules: [
				{ path: 'name', transform: 'text.trim', [transportFieldName('text.trim', 'collapse')]: true },
				{ path: 'email', transform: 'text.lowercase' },
				{ path: 'phone', transform: 'phone.format', [transportFieldName('phone.format', 'region')]: 'US' },
			],
		});

		expect(result).toEqual({ name: 'Ada Lovelace', email: 'ada@example.com', phone: '+12015550123' });
	});

	it('rejects invalid input with the Invalid Payload string', async () => {
		const rejection = await rejectionOf(value('phone.format', 'abc', { region: 'US' }));

		expect(typeof rejection).toBe('string');
		expect(JSON.parse(rejection as string)).toEqual({
			name: 'DirectusError',
			code: 'INVALID_PAYLOAD',
			status: 400,
			message: 'Invalid payload. not a valid phone number for the region.',
			extensions: { reason: 'not a valid phone number for the region' },
		});
	});

	it('rejects a configuration error as an ordinary error', async () => {
		const rejection = await rejectionOf({ mode: 'value', transform: 'no.such.transform', value: 'x' });

		expect(rejection).toBeInstanceOf(Error);
		expect((rejection as Error).message).toMatch(/the selected transform is unknown/);
	});
});
