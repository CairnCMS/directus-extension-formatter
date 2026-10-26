/// <reference types="@directus/extensions/api.d.ts" />
import type { SandboxOperationConfig } from 'directus:api';
import type { FormatterOptions } from '../lib/contract.js';
import { toDirectusRejection } from '../rejection.js';
import { runFormatter } from './run.js';

const operation: SandboxOperationConfig = {
	id: 'cairncms-formatter',
	handler: (options) => {
		try {
			return runFormatter(options as FormatterOptions);
		} catch (error) {
			throw toDirectusRejection(error);
		}
	},
};

export default operation;
