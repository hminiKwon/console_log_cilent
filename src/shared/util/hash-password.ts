const HASH_ALGORITHM = "SHA-256";

export async function hashPassword(password: string): Promise<string> {
	if (!globalThis.crypto?.subtle) {
		throw new Error("Unable to hash password securely in this environment.");
	}

	const encoder = new TextEncoder();
	const encoded = encoder.encode(password);
	const hashBuffer = await globalThis.crypto.subtle.digest(
		HASH_ALGORITHM,
		encoded
	);

	return Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
