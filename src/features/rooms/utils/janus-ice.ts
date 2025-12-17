import { env } from "@/shared/config";

export const buildIceServers = (): RTCIceServer[] => {
	const servers: RTCIceServer[] = [
		{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
	];

	if (env.turnUrl) {
		const urls = env.turnUrl.split(",").map((url) => url.trim()).filter(Boolean);
		if (urls.length > 0) {
			servers.push({
				urls,
				username: env.turnUsername || undefined,
				credential: env.turnCredential || undefined,
			});
		}
	}

	return servers;
};
