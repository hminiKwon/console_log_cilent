/**
 * Returns a pretty-printed JSON string.
 * - If input is already a JSON string, it will be parsed and re-stringified.
 * - If parsing fails, the original string is returned.
 */
export function formatJson(input: unknown, space = 2): string {
	if (input === undefined || input === null) return "";

	// Parse string input first so we can prettify raw JSON text.
	if (typeof input === "string") {
		try {
			const parsed = JSON.parse(input);
			return JSON.stringify(parsed, null, space);
		} catch {
			// Not valid JSON; return as-is.
			return input;
		}
	}

	try {
		return JSON.stringify(input, null, space);
	} catch {
		// If stringify fails (e.g., circular structures), fall back to toString.
		return String(input);
	}
}
