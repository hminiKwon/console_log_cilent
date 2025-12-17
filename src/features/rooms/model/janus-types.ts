/* eslint-disable @typescript-eslint/no-explicit-any */
export type RemoteFeed = {
	handle: any;
	stream: MediaStream | null;
};

export type RemoteStreamsMap = Record<string, MediaStream>;
