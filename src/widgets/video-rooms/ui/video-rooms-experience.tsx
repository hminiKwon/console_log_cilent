"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Janus } from "janus-gateway";
import {
	createRoom,
	deleteRoom,
	joinRoom,
	listRooms,
	type RoomCreateResponse,
	type RoomJoinResponse,
	type RoomSummary,
} from "@/features/rooms";
import { env } from "@/shared/config";
import { GlassPanel } from "@/shared/ui";
import { getHttpErrorMessage } from "@/shared/util";

type CreateFormState = {
	title: string;
	password: string;
	maxParticipants: number;
};

type JoinFormState = {
	roomNumber: string;
	password: string;
};

type RemoteFeed = {
	handle: any;
	stream: MediaStream | null;
};

const DEFAULT_MAX = 4;

const buildIceServers = (): RTCIceServer[] => {
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

export function VideoRoomsExperience() {
	const [rooms, setRooms] = useState<RoomSummary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [createForm, setCreateForm] = useState<CreateFormState>({
		title: "",
		password: "",
		maxParticipants: DEFAULT_MAX,
	});
	const [joinForm, setJoinForm] = useState<JoinFormState>({
		roomNumber: "",
		password: "",
	});
	const [listPasswords, setListPasswords] = useState<Record<string, string>>(
		{}
	);
	const [createResult, setCreateResult] = useState<RoomCreateResponse | null>(
		null
	);
	const [joinResult, setJoinResult] = useState<RoomJoinResponse | null>(null);
	const [activeRoom, setActiveRoom] = useState<RoomJoinResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [callError, setCallError] = useState<string | null>(null);

	const passwordHelper = "비밀번호는 선택사항 (4~6자리 숫자)";

	const resetErrors = () => {
		setError(null);
		setJoinResult(null);
		setCallError(null);
	};

	const fetchRooms = async () => {
		setIsLoading(true);
		resetErrors();
		try {
			const data = await listRooms();
			setRooms(data);
		} catch (err) {
			setError(getHttpErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchRooms();
	}, []);

	const validatePassword = (value: string) => {
		if (!value) return true;
		if (!/^[0-9]{4,6}$/.test(value)) return false;
		return true;
	};

	const handleCreate = async () => {
		resetErrors();
		const isPasswordValid = validatePassword(createForm.password);
		if (!createForm.title.trim()) {
			setError("방 제목을 입력해 주세요.");
			return;
		}
		if (!isPasswordValid) {
			setError("비밀번호는 4~6자리 숫자만 가능합니다.");
			return;
		}

		try {
			const passwordToUse = createForm.password;
			const payload = {
				title: createForm.title.trim(),
				max_participants: createForm.maxParticipants || DEFAULT_MAX,
				password: createForm.password || undefined,
			};
			const created = await createRoom(payload);
			setCreateResult(created);
			await handleJoin(created.room_number, passwordToUse);
			setCreateForm({ title: "", password: "", maxParticipants: DEFAULT_MAX });
			await fetchRooms();
		} catch (err) {
			setError(getHttpErrorMessage(err));
		}
	};

	const handleJoin = async (roomNumber: string, password?: string) => {
		resetErrors();
		try {
			const joined = await joinRoom(roomNumber, {
				password: password || undefined,
			});
			setJoinResult(joined);
			setActiveRoom(joined);
			setCallError(null);
			return joined;
		} catch (err) {
			setError(getHttpErrorMessage(err));
			return null;
		}
	};

	const handleDelete = async (roomNumber: string) => {
		resetErrors();
		try {
			await deleteRoom(roomNumber);
			await fetchRooms();
		} catch (err) {
			setError(getHttpErrorMessage(err));
		}
	};

	const handleListPasswordChange = (roomNumber: string, value: string) => {
		setListPasswords((prev) => ({ ...prev, [roomNumber]: value }));
	};

	const joinBadge = useMemo(() => {
		if (!joinResult) return null;
		return `입장 준비 완료 · 방번호 ${joinResult.room_number} (Janus: ${joinResult.janus_room_id})`;
	}, [joinResult]);

	const createBadge = useMemo(() => {
		if (!createResult) return null;
		return `새 방 생성됨 · 방번호 ${createResult.room_number} (Janus: ${createResult.janus_room_id})`;
	}, [createResult]);

	return (
		<section className="space-y-5">
			<div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
				<GlassPanel className="space-y-4">
					<header className="space-y-1">
						<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
							Create Room
						</p>
						<h1 className="text-2xl font-semibold text-slate-900">
							4인 WebRTC 방 생성
						</h1>
						<p className="text-sm text-slate-600">
							6자리 방번호는 서버에서 자동 생성됩니다. 비밀번호는 선택 (숫자
							4~6자리)입니다.
						</p>
					</header>
					<div className="space-y-3">
						<label className="block text-sm text-slate-700">
							제목
							<input
								value={createForm.title}
								onChange={(event) =>
									setCreateForm((prev) => ({
										...prev,
										title: event.target.value,
									}))
								}
								placeholder="예) 팀 스탠드업 / 동아리 회의"
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
							/>
						</label>
						<div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
							<label className="block text-sm text-slate-700">
								비밀번호 (선택)
								<input
									value={createForm.password}
									onChange={(event) =>
										setCreateForm((prev) => ({
											...prev,
											password: event.target.value,
										}))
									}
									maxLength={6}
									placeholder="숫자 4~6자리"
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
								/>
								<p className="mt-1 text-xs text-slate-500">{passwordHelper}</p>
							</label>
							<label className="block text-sm text-slate-700">
								최대 인원
								<input
									type="number"
									min={1}
									max={DEFAULT_MAX}
									value={createForm.maxParticipants}
									onChange={(event) =>
										setCreateForm((prev) => ({
											...prev,
											maxParticipants: Number(event.target.value),
										}))
									}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
								/>
							</label>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
							<span>최대 인원은 4명까지 지원합니다.</span>
							<button
								type="button"
								onClick={handleCreate}
								className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
							>
								방 생성
							</button>
						</div>
						{createBadge ? (
							<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
								{createBadge}
							</p>
						) : null}
					</div>
				</GlassPanel>

				<GlassPanel className="flex flex-col space-y-3">
					<header className="space-y-1">
						<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
							Join by Number
						</p>
						<h2 className="text-xl font-semibold text-slate-900">
							방 번호로 바로 입장
						</h2>
					</header>
					<div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
						<label className="block text-sm text-slate-700">
							방 번호 (6자리)
							<input
								value={joinForm.roomNumber}
								onChange={(event) =>
									setJoinForm((prev) => ({
										...prev,
										roomNumber: event.target.value,
									}))
								}
								maxLength={6}
								placeholder="예) 104200"
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
							/>
						</label>
						<label className="block text-sm text-slate-700">
							비밀번호 (선택)
							<input
								value={joinForm.password}
								onChange={(event) =>
									setJoinForm((prev) => ({
										...prev,
										password: event.target.value,
									}))
								}
								maxLength={6}
								placeholder="있다면 입력"
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
							/>
						</label>
					</div>
					<div className="flex items-center justify-between text-xs text-slate-600">
						<span>{passwordHelper}</span>
						<button
							type="button"
							onClick={() => handleJoin(joinForm.roomNumber, joinForm.password)}
							className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-500"
						>
							입장 시도
						</button>
					</div>
					{joinBadge ? (
						<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
							{joinBadge}
						</p>
					) : null}
					{error ? (
						<p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
							{error}
						</p>
					) : null}
					{callError ? (
						<p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
							{callError}
						</p>
					) : null}
				</GlassPanel>
			</div>

			<GlassPanel className="space-y-3">
				<header className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
							Room List
						</p>
						<h2 className="text-xl font-semibold text-slate-900">
							활성 방 목록 (최대 4인)
						</h2>
					</div>
					<button
						type="button"
						onClick={fetchRooms}
						className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
					>
						새로고침
					</button>
				</header>

				{isLoading ? (
					<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
						목록을 불러오는 중입니다...
					</div>
				) : rooms.length === 0 ? (
					<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
						현재 활성 방이 없습니다. 새 방을 만들어 보세요.
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{rooms.map((room) => {
							const passwordValue = listPasswords[room.room_number] ?? "";
							return (
								<div
									key={room.room_number}
									className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm"
								>
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<p className="text-sm uppercase tracking-[0.28em] text-emerald-700">
												Room {room.room_number}
											</p>
											<h3 className="text-lg font-semibold text-slate-900">
												{room.title}
											</h3>
											<p className="text-xs text-slate-600">
												최대 {room.max_participants}명 ·{" "}
												{room.need_password ? "비밀번호 필요" : "바로 입장 가능"}
											</p>
										</div>
										<button
											type="button"
											onClick={() => handleDelete(room.room_number)}
											className="text-xs text-rose-600 underline underline-offset-2"
										>
											삭제
										</button>
									</div>
									<div className="mt-3 flex items-center gap-2">
										{room.need_password ? (
											<input
												value={passwordValue}
												onChange={(event) =>
													handleListPasswordChange(
														room.room_number,
														event.target.value
													)
												}
												maxLength={6}
												placeholder="비밀번호"
												className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
											/>
										) : (
											<div className="text-xs text-emerald-700">
												비밀번호 없음
											</div>
										)}
										<button
											type="button"
											onClick={() =>
												handleJoin(room.room_number, passwordValue || undefined)
											}
											className="rounded-2xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
										>
											입장
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</GlassPanel>

			{activeRoom ? (
				<CallPanel
					room={activeRoom}
					onLeave={() => {
						setActiveRoom(null);
						setJoinResult(null);
					}}
					onError={(message) => setCallError(message)}
				/>
			) : null}
		</section>
	);
}

type CallPanelProps = {
	room: RoomJoinResponse;
	onLeave: () => void;
	onError: (message: string) => void;
};

function CallPanel({ room, onLeave, onError }: CallPanelProps) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<
		Record<string, MediaStream>
	>({});
	const [status, setStatus] = useState("미디어 준비 중...");
	const localStreamRef = useRef<MediaStream | null>(null);
	const janusRef = useRef<any>(null);
	const publisherHandleRef = useRef<any>(null);
	const feedsRef = useRef<Record<number, RemoteFeed>>({});

	const janusRoomId = Number(
		room.janus_room_id ?? room.room_number ?? NaN
	);

	useEffect(() => {
		let mounted = true;
		let JanusLib: typeof Janus | null = null;

		const start = async () => {
			if (!env.signalingWsUrl) {
				onError("NEXT_PUBLIC_SIGNALING_WS_URL 환경변수를 설정해 주세요.");
				return;
			}
			if (Number.isNaN(janusRoomId)) {
				onError("Janus 방 번호를 숫자로 변환할 수 없습니다.");
				return;
			}

			try {
				const adapterModule = await import("webrtc-adapter");
				const adapterExport = (adapterModule as any).default ?? adapterModule;
				if (adapterExport && typeof window !== "undefined") {
					// Janus는 전역 adapter를 기대하므로 명시적으로 설정
					(window as any).adapter = adapterExport;
				}
				const janusModule = await import("janus-gateway");
				JanusLib = (janusModule as any).Janus ?? (janusModule as any).default;
			} catch (err) {
				onError("Janus 라이브러리를 불러오지 못했습니다.");
				return;
			}

			if (!JanusLib?.init) {
				onError("Janus 클라이언트가 올바르게 로드되지 않았습니다.");
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
							attachPublisher(JanusLib);
						},
						error: (err: unknown) => {
							onError(
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
					onError(
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

		start();

		return () => {
			mounted = false;
			Object.values(feedsRef.current).forEach((feed) => {
				feed.handle?.detach?.();
			});
			publisherHandleRef.current?.detach?.();
			janusRef.current?.destroy();
			setRemoteStreams({});
			localStreamRef.current?.getTracks().forEach((track) => track.stop());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [janusRoomId]);

	const handlePublisherMessage = (
		JanusLib: typeof Janus,
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
				publishers.forEach((p) => newRemoteFeed(JanusLib, p.id, p.display));
			}
		} else if (event === "event") {
			const publishers = msg["publishers"] as
				| { id: number; display: string }[]
				| undefined;
			if (publishers) {
				publishers.forEach((p) => newRemoteFeed(JanusLib, p.id, p.display));
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

	const publishOwnFeed = () => {
		if (!publisherHandleRef.current) return;
		publisherHandleRef.current.createOffer({
			// publisher는 송출만 하면 되므로 recv를 끈다.
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
				onError("로컬 미디어를 송출하지 못했습니다.");
			},
		});
	};

	const newRemoteFeed = (
		JanusLib: typeof Janus,
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
				onError("원격 피드를 구독하지 못했습니다.");
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
							onError("원격 피드 응답 생성에 실패했습니다.");
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
				feedsRef.current[id] = { handle: feedsRef.current[id]?.handle, stream };
			},
			onremotetrack: (track: MediaStreamTrack, on: boolean) => {
				if (!track) return;
				const existing = feedsRef.current[id]?.stream ?? new MediaStream();
				if (on) {
					existing.addTrack(track);
				} else {
					existing.removeTrack(track);
				}
				feedsRef.current[id] = { handle: feedsRef.current[id]?.handle, stream: existing };
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

	const handleLeave = () => {
		Object.values(feedsRef.current).forEach((feed) => feed.handle?.detach?.());
		feedsRef.current = {};
		publisherHandleRef.current?.detach?.();
		janusRef.current?.destroy();
		setRemoteStreams({});
		localStreamRef.current?.getTracks().forEach((track) => track.stop());
		onLeave();
	};

	const remoteIds = Object.keys(remoteStreams);

	return (
		<GlassPanel className="space-y-3 bg-white">
			<header className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
						Live Call
					</p>
					<h3 className="text-xl font-semibold text-slate-900">
						방 {room.room_number} · Janus #{room.janus_room_id}
					</h3>
					<p className="text-sm text-slate-600">
						{status}{" "}
						{!localStream ? "(내 영상 수신 대기 중... 카메라 권한 확인)" : ""}
					</p>
				</div>
				<button
					type="button"
					onClick={handleLeave}
					className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
				>
					통화 종료
				</button>
			</header>

			<div className="grid gap-3 md:grid-cols-2">
				<VideoTile label="나" stream={localStream} isLocal />
				{remoteIds.length === 0 ? (
					<div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-600">
						다른 참가자가 입장하면 여기에 표시됩니다.
					</div>
				) : null}
				{remoteIds.map((id) => (
					<VideoTile
						key={id}
						label={`Peer ${id.slice(-4)}`}
						stream={remoteStreams[id]}
					/>
				))}
			</div>
		</GlassPanel>
	);
}

type VideoTileProps = {
	label: string;
	stream: MediaStream | null;
	isLocal?: boolean;
};

function VideoTile({ label, stream, isLocal }: VideoTileProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
			videoRef.current
				.play()
				.catch(() => {
					/* 모바일 브라우저 등에서 자동재생 차단 시 무시 */
				});
		}
	}, [stream]);

	return (
		<div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={isLocal}
				className="h-full w-full object-cover"
			/>
			<div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
				{label}
			</div>
		</div>
	);
}
