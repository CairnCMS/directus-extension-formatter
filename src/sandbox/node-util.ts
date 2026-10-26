// Stands in for node:util in the sandboxed build, where only directus:api can be imported.
// Values copied into an isolate are never proxies, so the check is always false there.
export const types = {
	isProxy: (_value: unknown): boolean => false,
};
