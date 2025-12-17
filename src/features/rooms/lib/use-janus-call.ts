/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

	const janusRef = useRef<any>(null);
	const publisherRef = useRef<any>(null);
	const feedsRef = useRef<Record<number, RemoteFeed>>({});

	const localStreamRef = useRef<MediaStream | null>(null);
	const remoteStreamsRef = useRef<RemoteStreamsMap>({});

	const cleaningPromiseRef = useRef<Promise<void> | null>(null);
	const startedRef = useRef(false);

	const onErrorRef = useRef(onError);
	useEffect(() => {
		onErrorRef.current = onError;
	}, [onError]);

	const safeOnError = useCallback((message: string) => {
		onErrorRef.current?.(message);
	}, []);

	const janusRoomId = useMemo(
		() => Number(room.janus_room_id ?? room.room_number ?? NaN),
		[room.janus_room_id, room.room_number]
	);

	const stopTracks = useCallback((stream?: MediaStream | null) => {
		if (!stream) return;
		try {
			const tracks = stream.getTracks?.();
			if (tracks && Array.isArray(tracks)) {
				tracks.forEach((t) => {
					try {
						t.stop();
					} catch {
						// noop
					}
				});
			}
		} catch {
			// noop
		}
	}, []);

	const safeSend = useCallback((handle: any, message: any) => {
		try {
			handle?.send?.({ message });
		} catch {
			// noop
		}
	}, []);

	const stopHandle = useCallback(
		(handle: any, opts?: { isPublisher?: boolean }) => {
			if (!handle) return;

			const isPublisher = Boolean(opts?.isPublisher);

			// 1) 트랙/피어커넥션 강제 정리 (먼저 처리)
			try {
				const pc = handle?.webrtcStuff?.pc;
				if (pc) {
					// Senders의 트랙 정리
					const senders = pc.getSenders?.() ?? [];
					senders.forEach((s: RTCRtpSender) => {
						try {
							// 연결된 트랙을 먼저 분리
							if (typeof s.replaceTrack === "function") {
								s.replaceTrack(null).catch(() => {
									/* noop */
								});
							}

							// 트랙 정지
							if (s?.track) {
								s.track.stop();
							}
						} catch {
							// noop
						}
					});

					// Receivers의 트랙 정리
					const receivers = pc.getReceivers?.() ?? [];
					receivers.forEach((r: RTCRtpReceiver) => {
						try {
							if (r?.track) {
								r.track.stop();
							}
						} catch {
							// noop
						}
					});

					// Transceivers까지 정리 (가능한 경우)
					const transceivers = pc.getTransceivers?.() ?? [];
					transceivers.forEach((t: RTCRtpTransceiver) => {
						try {
							if (t?.stop) t.stop();
						} catch {
							// noop
						}
					});

					// PeerConnection 종료
					try {
						if (pc.connectionState !== "closed") {
							pc.close();
						}
					} catch {
						// noop
					}
				}
			} catch {
				// noop
			}

			// 2) 로컬 스트림 정리
			try {
				stopTracks(handle?.webrtcStuff?.myStream);
				// 스트림에서 트랙 제거로 연결 참조도 해제
				handle?.webrtcStuff?.myStream
					?.getTracks?.()
					.forEach((t: MediaStreamTrack) => {
						try {
							handle?.webrtcStuff?.myStream?.removeTrack?.(t);
						} catch {
							// noop
						}
					});
				// 내부 참조 제거 시도
				if (handle?.webrtcStuff) {
					handle.webrtcStuff.myStream = null;
				}
			} catch {
				// noop
			}

			// 3) 외부 스트림 정리
			try {
				stopTracks(handle?.webrtcStuff?.streamExternal);
				handle?.webrtcStuff?.streamExternal
					?.getTracks?.()
					?.forEach((t: MediaStreamTrack) => {
						try {
							handle?.webrtcStuff?.streamExternal?.removeTrack?.(t);
						} catch {
							// noop
						}
					});
				if (handle?.webrtcStuff) {
					handle.webrtcStuff.streamExternal = null;
				}
			} catch {
				// noop
			}

			// 4) Janus Videoroom 레벨 정리 요청 (가능한 경우)
			//    - publisher: unpublish → leave
			//    - subscriber: leave
			try {
				if (isPublisher) {
					safeSend(handle, { request: "unpublish" });
				}
				safeSend(handle, { request: "leave" });
			} catch {
				// noop
			}

			// 5) WebRTC hangup
			try {
				handle?.hangup?.();
			} catch {
				// noop
			}

			// 6) 핸들 detach
			try {
				handle?.detach?.();
			} catch {
				// noop
			}
		},
		[safeSend, stopTracks]
	);

	const cleanup = useCallback(async () => {
		// 중복 cleanup 방지: 이미 실행 중이면 그 Promise를 재사용
		if (cleaningPromiseRef.current) return cleaningPromiseRef.current;

		cleaningPromiseRef.current = (async () => {
			startedRef.current = false;

			// UI 상태 먼저 정리(원하면 뒤로 빼도 됨)
			setStatus("세션을 종료하는 중...");

			// remote feeds 정리
			try {
				Object.values(feedsRef.current).forEach((feed) =>
					stopHandle(feed.handle, { isPublisher: false })
				);
			} catch {
				// noop
			}
			feedsRef.current = {};

			// publisher 정리 (unpublish 포함)
			try {
				stopHandle(publisherRef.current, { isPublisher: true });
			} catch {
				// noop
			}
			publisherRef.current = null;

			// janus destroy는 마지막에
			const janus = janusRef.current;
			janusRef.current = null;

			// remote streams stop + state reset
			try {
				Object.values(remoteStreamsRef.current).forEach((s) => stopTracks(s));
			} catch {
				// noop
			}
			remoteStreamsRef.current = {};
			setRemoteStreams({});

			// local stream stop + state reset
			try {
				stopTracks(localStreamRef.current);
			} catch {
				// noop
			}
			localStreamRef.current = null;
			setLocalStream(null);

			// janus destroy (콜백 루프 방지를 위해 destroyed에서 cleanup 다시 호출하지 않음)
			try {
				janus?.destroy?.({
					cleanupHandles: true,
					notifyDestroyed: true,
					unload: true,
				});
			} catch {
				// noop
			}

			setStatus("세션이 종료되었습니다.");
		})();

		try {
			await cleaningPromiseRef.current;
		} finally {
			cleaningPromiseRef.current = null;
		}
	}, [stopHandle, stopTracks]);

	const removeFeed = useCallback(
		(id: number | string) => {
			const feedId = Number(id);
			const feed = feedsRef.current[feedId];

			// 트랙 정리 먼저 수행
			try {
				stopTracks(feed?.stream);
			} catch {
				// noop
			}

			stopHandle(feed?.handle, { isPublisher: false });
			delete feedsRef.current[feedId];

			setRemoteStreams((prev) => {
				const { [String(feedId)]: _removed, ...rest } = prev;
				remoteStreamsRef.current = rest;
				return rest;
			});
		},
		[stopHandle, stopTracks]
	);

	const newRemoteFeed = useCallback(
		(JanusLib: typeof Janus, id: number, display?: string) => {
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
				error: () => safeOnError("원격 피드를 구독하지 못했습니다."),
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
							error: () =>
								safeOnError("원격 피드 응답 생성에 실패했습니다."),
						});
					}

					const leaving = msg["leaving"];
					if (leaving) removeFeed(leaving);
				},
				// 일부 Janus 버전/브라우저에서는 onremotestream 대신 onremotetrack 위주로 옴
				onremotestream: (stream: MediaStream) => {
					const normalized = new MediaStream(stream.getTracks());
					setRemoteStreams((prev) => {
						const next = { ...prev, [String(id)]: normalized };
						remoteStreamsRef.current = next;
						return next;
					});
					feedsRef.current[id] = {
						handle: feedsRef.current[id]?.handle,
						stream: normalized,
					};
				},
				onremotetrack: (track: MediaStreamTrack, on: boolean) => {
					if (!track) return;
					const existing =
						feedsRef.current[id]?.stream ?? new MediaStream();

					try {
						if (on) existing.addTrack(track);
						else existing.removeTrack(track);
					} catch {
						// noop
					}

					feedsRef.current[id] = {
						handle: feedsRef.current[id]?.handle,
						stream: existing,
					};

					// 동일한 트랙을 새 MediaStream에 담아 React 렌더를 트리거
					setRemoteStreams((prev) => {
						const next = {
							...prev,
							[String(id)]: new MediaStream(existing.getTracks()),
						};
						remoteStreamsRef.current = next;
						return next;
					});
				},
				oncleanup: () => removeFeed(id),
			});
		},
		[janusRoomId, removeFeed, safeOnError]
	);

	const publishOwnFeed = useCallback(() => {
		if (!publisherRef.current) return;

		publisherRef.current.createOffer({
			media: {
				audioSend: true,
				videoSend: true,
				audioRecv: false,
				videoRecv: false,
			},
			success: (jsep: any) => {
				publisherRef.current.send({
					message: { request: "publish", audio: true, video: true },
					jsep,
				});
				setStatus("송출 중 · 참가자 대기");
			},
			error: () => safeOnError("로컬 미디어를 송출하지 못했습니다."),
		});
	}, [safeOnError]);

	const handlePublisherMessage = useCallback(
		(JanusLib: typeof Janus, msg: any, jsep: any) => {
			const event = msg["videoroom"];

			if (event === "joined") {
				setStatus("방 참여 완료 · 송출 준비 중");
				publishOwnFeed();

				const publishers = msg["publishers"] as
					| { id: number; display: string }[]
					| undefined;

				publishers?.forEach((p) => newRemoteFeed(JanusLib, p.id, p.display));
			} else if (event === "event") {
				const publishers = msg["publishers"] as
					| { id: number; display: string }[]
					| undefined;
				publishers?.forEach((p) => newRemoteFeed(JanusLib, p.id, p.display));

				const leaving = msg["leaving"];
				if (leaving) removeFeed(leaving);
			}

			if (jsep) publisherRef.current?.handleRemoteJsep({ jsep });
		},
		[newRemoteFeed, publishOwnFeed, removeFeed]
	);

	const attachPublisher = useCallback(
		(JanusLib: typeof Janus) => {
			if (!janusRef.current) {
				safeOnError("Janus 세션이 유효하지 않습니다. 다시 시도해 주세요.");
				return;
			}

			janusRef.current.attach({
				plugin: "janus.plugin.videoroom",
				success: (pluginHandle: any) => {
					publisherRef.current = pluginHandle;
					setStatus("방 참여 중...");
					pluginHandle.send({
						message: { request: "join", room: janusRoomId, ptype: "publisher" },
					});
				},
				error: (err: unknown) => {
					safeOnError(
						err instanceof Error ? err.message : "비디오룸 플러그인 attach 실패"
					);
					void cleanup();
				},
				consentDialog: (on: boolean) => {
					setStatus(on ? "미디어 권한 요청 중..." : "권한 확인 완료");
				},
				onmessage: (msg: any, jsep: any) =>
					handlePublisherMessage(JanusLib, msg, jsep),
				onlocalstream: (stream: MediaStream) => {
					localStreamRef.current = stream;
					setLocalStream(new MediaStream(stream.getTracks()));
				},
				onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
					if (!track) return;

					let stream = localStreamRef.current;
					if (!stream) {
						stream = new MediaStream();
						localStreamRef.current = stream;
					}

					try {
						if (on) stream.addTrack(track);
						else stream.removeTrack(track);
					} catch {
						// noop
					}

					setLocalStream(new MediaStream(stream.getTracks()));
				},
				oncleanup: () => {
					// 중요: 여기서도 실제 트랙 stop
					stopTracks(localStreamRef.current);
					localStreamRef.current = null;
					setLocalStream(null);
				},
			});
		},
		[cleanup, handlePublisherMessage, janusRoomId, safeOnError, stopTracks]
	);

	useEffect(() => {
		let JanusLib: typeof Janus | null = null;
		let cancelled = false;

		const start = async () => {
			if (startedRef.current) return;
			startedRef.current = true;

			if (!env.signalingWsUrl) {
				safeOnError("NEXT_PUBLIC_SIGNALING_WS_URL 환경변수를 설정해 주세요.");
				startedRef.current = false;
				return;
			}
			if (Number.isNaN(janusRoomId)) {
				safeOnError("Janus 방 번호를 숫자로 변환할 수 없습니다.");
				startedRef.current = false;
				return;
			}

			try {
				const adapterModule = await import("webrtc-adapter");
				const adapterExport = (adapterModule as any).default ?? adapterModule;
				if (adapterExport && typeof window !== "undefined") {
					(window as any).adapter = adapterExport;
				}

				const janusModule = await import("janus-gateway");
				JanusLib = (janusModule as any).Janus ?? (janusModule as any).default;
			} catch {
				safeOnError("Janus 라이브러리를 불러오지 못했습니다.");
				startedRef.current = false;
				return;
			}

			if (!JanusLib?.init) {
				safeOnError("Janus 클라이언트가 올바르게 로드되지 않았습니다.");
				startedRef.current = false;
				return;
			}

			JanusLib.init({
				debug: false,
				callback: () => {
					if (cancelled) return;

					setStatus("세션 준비 중...");

					janusRef.current = new JanusLib!({
						server: env.signalingWsUrl,
						iceServers: buildIceServers(),
						success: () => attachPublisher(JanusLib as typeof Janus),
						error: (err: unknown) => {
							safeOnError(
								err instanceof Error
									? err.message
									: "Janus 세션을 생성하지 못했습니다."
							);
							void cleanup();
						},
						destroyed: () => {
							// 여기서 cleanup() 다시 호출하지 않기 (루프/중복 정리 방지)
							setStatus("세션이 종료되었습니다.");
						},
					});
				},
			});
		};

		void start();

		return () => {
			cancelled = true;
			void cleanup();
		};
	}, [attachPublisher, cleanup, janusRoomId, safeOnError]);

	const handleLeave = useCallback(() => {
		void cleanup();
	}, [cleanup]);

	return { status, localStream, remoteStreams, handleLeave };
}
