import { useCallback, useEffect, useRef, useState } from "react";
import type { Janus } from "janus-gateway";
import { env } from "@/shared/config";
import type { RoomJoinResponse } from "../api";
import { buildIceServers } from "../utils/janus-ice";
import type { RemoteFeed, RemoteStreamsMap } from "../model/janus-types";

type UseJanusCallParams = {
	room: RoomJoinResponse;
	onError: (message: string) => void;
};

export function useJanusCall({ room, onError }: UseJanusCallParams) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<RemoteStreamsMap>({});
	const [status, setStatus] = useState("미디어 준비 중...");

	const localStreamRef = useRef<MediaStream | null>(null);
	const janusRef = useRef<any>(null);
	const publisherHandleRef = useRef<any>(null);
	const feedsRef = useRef<Record<number, RemoteFeed>>({});
	const onErrorRef = useRef(onError);

	useEffect(() => {
		onErrorRef.current = onError;
	}, [onError]);

	const safeOnError = useCallback((message: string) => {
		onErrorRef.current?.(message);
	}, []);

	const cleanup = useCallback(() => {
		Object.values(feedsRef.current).forEach((feed) => feed.handle?.detach?.());
		feedsRef.current = {};
		publisherHandleRef.current?.detach?.();
		janusRef.current?.destroy();
		setRemoteStreams({});
		localStreamRef.current?.getTracks().forEach((track) => track.stop());
	}, []);

	const janusRoomId = Number(room.janus_room_id ?? room.room_number ?? NaN);

	useEffect(() => {
		let mounted = true;
		let JanusLib: typeof Janus | null = null;

		const removeFeed = (id: number | string) => {
			const feedId = Number(id);
			const feed = feedsRef.current[feedId];
			if (feed?.handle) {
				feed.handle.detach?.();
			}
			delete feedsRef.current[feedId];
			setRemoteStreams((prev) => {
				const { [String(feedId)]: _, ...rest } = prev;
				return rest;
			});
		};

		const newRemoteFeed = (
			JanusLibLocal: typeof Janus,
			id: number,
			display?: string
		) => {
			if (!janusRef.current) return;

			janusRef.current.attach({
				plugin: "janus.plugin.videoroom",
				success: (pluginHandle: any) => {
					feedsRef.current[id] = { handle: pluginHandle, stream: null };
					pluginHandle.send({
						message: {
							request: "join",
							room: janusRoomId,
							ptype: "subscriber",
							feed: id,
							display,
						},
					});
				},
				error: () => {
					safeOnError("원격 피드를 구독하지 못했습니다.");
				},
				onmessage: (msg: any, jsep: any) => {
					if (jsep) {
						feedsRef.current[id]?.handle?.createAnswer({
							jsep,
							media: { audioSend: false, videoSend: false },
							success: (answerJsep: any) => {
								feedsRef.current[id]?.handle?.send({
									message: { request: "start", room: janusRoomId },
									jsep: answerJsep,
								});
							},
							error: () => {
								safeOnError("원격 피드 응답 생성에 실패했습니다.");
							},
						});
					}

					const leaving = msg["leaving"];
					if (leaving) {
						removeFeed(leaving);
					}
				},
				onremotestream: (stream: MediaStream) => {
					setRemoteStreams((prev) => ({
						...prev,
						[String(id)]: stream,
					}));
					feedsRef.current[id] = {
						handle: feedsRef.current[id]?.handle,
						stream,
					};
				},
				onremotetrack: (track: MediaStreamTrack, on: boolean) => {
					if (!track) return;
					const existing = feedsRef.current[id]?.stream ?? new MediaStream();
					if (on) {
						existing.addTrack(track);
					} else {
						existing.removeTrack(track);
					}
					feedsRef.current[id] = {
						handle: feedsRef.current[id]?.handle,
						stream: existing,
					};
					setRemoteStreams((prev) => ({
						...prev,
						[String(id)]: existing.clone(),
					}));
				},
				oncleanup: () => {
					removeFeed(id);
				},
			});
		};

		const publishOwnFeed = () => {
			if (!publisherHandleRef.current) return;
			publisherHandleRef.current.createOffer({
				media: {
					audioSend: true,
					videoSend: true,
					audioRecv: false,
					videoRecv: false,
				},
				success: (jsep: any) => {
					publisherHandleRef.current.send({
						message: { request: "publish", audio: true, video: true },
						jsep,
					});
					setStatus("송출 중 · 참가자 대기");
				},
				error: () => {
					safeOnError("로컬 미디어를 송출하지 못했습니다.");
				},
			});
		};

		const handlePublisherMessage = (
			JanusLibLocal: typeof Janus,
			msg: any,
			jsep: any
		) => {
			const event = msg["videoroom"];
			if (event === "joined") {
				setStatus("방 참여 완료 · 송출 준비 중");
				publishOwnFeed();
				const publishers = msg["publishers"] as
					| { id: number; display: string }[]
					| undefined;
				if (publishers) {
					publishers.forEach((p) =>
						newRemoteFeed(JanusLibLocal, p.id, p.display)
					);
				}
			} else if (event === "event") {
				const publishers = msg["publishers"] as
					| { id: number; display: string }[]
					| undefined;
				if (publishers) {
					publishers.forEach((p) =>
						newRemoteFeed(JanusLibLocal, p.id, p.display)
					);
				}
				const leaving = msg["leaving"];
				if (leaving) {
					removeFeed(leaving);
				}
			}

			if (jsep) {
				publisherHandleRef.current?.handleRemoteJsep({ jsep });
			}
		};

		const attachPublisher = (JanusLibLocal: typeof Janus) => {
			janusRef.current.attach({
				plugin: "janus.plugin.videoroom",
				success: (pluginHandle: any) => {
					publisherHandleRef.current = pluginHandle;
					setStatus("방 참여 중...");
					pluginHandle.send({
						message: {
							request: "join",
							room: janusRoomId,
							ptype: "publisher",
						},
					});
				},
				error: (err: unknown) => {
					safeOnError(
						err instanceof Error
							? err.message
							: "비디오룸 플러그인 attach 실패"
					);
				},
				consentDialog: (on: boolean) => {
					setStatus(on ? "미디어 권한 요청 중..." : "권한 확인 완료");
				},
				onmessage: (msg: any, jsep: any) => {
					handlePublisherMessage(JanusLibLocal, msg, jsep);
				},
				onlocalstream: (stream: MediaStream) => {
					localStreamRef.current = stream;
					setLocalStream(stream);
				},
				onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
					if (!track) return;
					let stream = localStreamRef.current;
					if (!stream) {
						stream = new MediaStream();
						localStreamRef.current = stream;
					}
					if (on) {
						stream.addTrack(track);
					} else {
						stream.removeTrack(track);
					}
					setLocalStream(stream.clone());
				},
				onremotestream: () => {
					// publisher handle는 remote stream을 갖지 않습니다.
				},
				oncleanup: () => {
					setLocalStream(null);
				},
			});
		};

		const start = async () => {
			if (!env.signalingWsUrl) {
				safeOnError("NEXT_PUBLIC_SIGNALING_WS_URL 환경변수를 설정해 주세요.");
				return;
			}
			if (Number.isNaN(janusRoomId)) {
				safeOnError("Janus 방 번호를 숫자로 변환할 수 없습니다.");
				return;
			}

			try {
				const adapterModule = await import("webrtc-adapter");
				const adapterExport =
					(adapterModule as any).default ?? adapterModule;
				if (adapterExport && typeof window !== "undefined") {
					(window as any).adapter = adapterExport;
				}
				const janusModule = await import("janus-gateway");
				JanusLib = (janusModule as any).Janus ?? (janusModule as any).default;
			} catch (err) {
				safeOnError("Janus 라이브러리를 불러오지 못했습니다.");
				return;
			}

			if (!JanusLib?.init) {
				safeOnError("Janus 클라이언트가 올바르게 로드되지 않았습니다.");
				return;
			}

			JanusLib.init({
				debug: false,
				callback: () => {
					if (!mounted) return;
					janusRef.current = new JanusLib({
						server: env.signalingWsUrl,
						iceServers: buildIceServers(),
						success: () => {
							attachPublisher(JanusLib as typeof Janus);
						},
						error: (err: unknown) => {
							safeOnError(
								err instanceof Error
									? err.message
									: "Janus 세션을 생성하지 못했습니다."
							);
						},
						destroyed: () => {
							setStatus("세션이 종료되었습니다.");
						},
					});
				},
			});
		};

		start();

		return () => {
			mounted = false;
			cleanup();
		};
	}, [janusRoomId, safeOnError, cleanup]);

	const handleLeave = useCallback(() => {
		cleanup();
	}, [cleanup]);

	return {
		status,
		localStream,
		remoteStreams,
		handleLeave,
	};
}
