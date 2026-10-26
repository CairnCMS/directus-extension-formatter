import { describe, expect, it } from 'vitest';
import operation from '../src/api/index.js';
import { FormatterError, type FormatterErrorCode } from '../src/lib/errors.js';
import { transportFieldName } from '../src/lib/transport.js';
import { toDirectusRejection } from '../src/rejection.js';

const phoneRegion = transportFieldName('phone.format', 'region');

function thrownBy(fn: () => unknown): unknown {
	try {
		fn();
	} catch (error) {
		return error;
	}

	throw new Error('expected a rejection');
}

describe('toDirectusRejection', () => {
	it('turns end-user input errors into a Directus Invalid Payload rejection', () => {
		const rejection = toDirectusRejection(
			new FormatterError('INVALID_INPUT', 'not a valid phone number for the region', { transform: 'phone.format', index: 2 })
		);

		expect(typeof rejection).toBe('string');
		expect(JSON.parse(rejection as string)).toEqual({
			name: 'DirectusError',
			code: 'INVALID_PAYLOAD',
			status: 400,
			message: 'Invalid payload. not a valid phone number for the region.',
			extensions: { reason: 'not a valid phone number for the region' },
		});
	});

	it('returns every other Formatter error unchanged', () => {
		const codes: FormatterErrorCode[] = [
			'INVALID_OPTION',
			'UNKNOWN_OPTION',
			'SOURCE_SHAPE',
			'RESULT_SHAPE',
			'BOUND_EXCEEDED',
			'INVALID_PATH',
			'ICU_UNAVAILABLE',
			'UNKNOWN_TRANSFORM',
			'INTERNAL',
		];

		for (const code of codes) {
			const error = new FormatterError(code, 'reason');
			expect(toDirectusRejection(error)).toBe(error);
		}
	});

	it('returns errors that are not Formatter errors unchanged', () => {
		const error = new TypeError('boom');
		expect(toDirectusRejection(error)).toBe(error);
		expect(toDirectusRejection('a string')).toBe('a string');
		expect(toDirectusRejection(null)).toBeNull();
	});
});

describe('the Directus operation handler', () => {
	it('returns the formatted value', () => {
		expect(operation.handler({ mode: 'value', transform: 'phone.format', [phoneRegion]: 'US', value: '2015550123' })).toBe(
			'+12015550123'
		);
	});

	it('throws the Invalid Payload rejection for invalid input', () => {
		const thrown = thrownBy(() =>
			operation.handler({ mode: 'value', transform: 'phone.format', [phoneRegion]: 'US', value: 'abc' })
		);

		expect(JSON.parse(thrown as string)).toMatchObject({
			code: 'INVALID_PAYLOAD',
			status: 400,
			extensions: { reason: 'not a valid phone number for the region' },
		});
	});

	it('throws configuration errors unchanged, so Directus reports them as internal', () => {
		const thrown = thrownBy(() => operation.handler({ mode: 'value', transform: 'no.such.transform', value: 'x' }));

		expect(thrown).toBeInstanceOf(FormatterError);
		expect((thrown as FormatterError).code).toBe('UNKNOWN_TRANSFORM');
	});
});
