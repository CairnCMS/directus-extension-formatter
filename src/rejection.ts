import { FormatterError, isEndUserInputError } from './lib/errors.js';

// Thrown as a JSON string because only a thrown value's message survives the sandbox
// boundary. Flows parse a JSON-string rejection back into an object, and Directus reads
// this shape as an Invalid Payload error with status 400.
export function toDirectusRejection(error: unknown): unknown {
	if (error instanceof FormatterError && isEndUserInputError(error.code)) {
		return JSON.stringify({
			name: 'DirectusError',
			code: 'INVALID_PAYLOAD',
			status: 400,
			message: `Invalid payload. ${error.reason}.`,
			extensions: { reason: error.reason },
		});
	}

	return error;
}
