export type EncodeMethod = "base64" | "url" | "sha256";

export const ENCODE_METHOD_LABELS: Record<EncodeMethod, string> = {
	base64: "Base64",
	url: "URL Encode",
	sha256: "SHA-256",
};

const toBase64 = (value: string) => {
	// Handle unicode safely
	try {
		return btoa(unescape(encodeURIComponent(value)));
	} catch {
		return "";
	}
};

const toUrlEncoded = (value: string) => encodeURIComponent(value);

const toSha256 = async (value: string) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(value);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const bytes = Array.from(new Uint8Array(hashBuffer));
	return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const encodeValue = async (value: string, method: EncodeMethod) => {
	if (!value) return "";
	if (method === "base64") return toBase64(value);
	if (method === "url") return toUrlEncoded(value);
	return toSha256(value);
};
