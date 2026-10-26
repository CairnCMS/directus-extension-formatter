import type { FormatterOptions } from '../lib/contract.js';
import { FormatterError } from '../lib/errors.js';
import { applyWithEmptyPolicy, coerceEmptyHandling } from '../lib/fallback.js';
import { defaultContext, registerBuiltins } from '../lib/index.js';
import { newBudget, parseValueOptions, readMode } from '../lib/options.js';
import { getTransform } from '../lib/registry.js';
import { cloneAndMeasureResult } from '../lib/result.js';
import { runStructured } from '../lib/structured.js';

registerBuiltins();

function runValueMode(options: FormatterOptions): unknown {
	const parsed = parseValueOptions(options, newBudget());
	const definition = getTransform(parsed.transformId);

	if (definition === undefined) {
		throw new FormatterError('UNKNOWN_TRANSFORM', 'the selected transform is unknown');
	}

	const apply = definition.prepare(parsed.transformOptions, defaultContext());
	const policy = coerceEmptyHandling(parsed.onEmpty, parsed.whenEmpty, parsed.transformId);

	const result = applyWithEmptyPolicy(parsed.value, policy, apply, parsed.transformId);
	return cloneAndMeasureResult(result).value;
}

export function runFormatter(options: FormatterOptions): unknown {
	if (readMode(options) === 'structured') {
		return runStructured(options, defaultContext());
	}

	return runValueMode(options);
}
