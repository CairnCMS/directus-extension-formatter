import { fileURLToPath } from 'node:url';

const nodeUtilStub = fileURLToPath(new URL('./src/sandbox/node-util.ts', import.meta.url));

export default {
	plugins: [
		{
			name: 'sandbox-node-util',
			resolveId(source) {
				return source === 'node:util' ? nodeUtilStub : null;
			},
		},
	],
};
