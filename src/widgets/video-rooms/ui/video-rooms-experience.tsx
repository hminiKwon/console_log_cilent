"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createRoom,
	deleteRoom,
	joinRoom,
	listRooms,
	type RoomCreateResponse,
	type RoomJoinResponse,
	type RoomSummary,
	DEFAULT_MAX_PARTICIPANTS,
	isValidRoomPassword,
} from "@/features/rooms";
import { ROOM_PASSWORD_HELPER } from "../model/constants";
import { GlassPanel } from "@/shared/ui";
import { getHttpErrorMessage } from "@/shared/lib";
import {
	buildInitialCreateForm,
	buildInitialJoinForm,
	type CreateFormState,
	type JoinFormState,
} from "../model/forms";
import { CallPanel } from "./call-panel";
import { CreateRoomForm } from "./create-room-form";
import { JoinRoomForm } from "./join-room-form";
import { RoomsList } from "./rooms-list";

export function VideoRoomsExperience() {
	const [rooms, setRooms] = useState<RoomSummary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [createForm, setCreateForm] = useState<CreateFormState>(
		buildInitialCreateForm(DEFAULT_MAX_PARTICIPANTS)
	);
	const [joinForm, setJoinForm] = useState<JoinFormState>(
		buildInitialJoinForm()
	);
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

	const resetErrors = () => {
		setError(null);
		setJoinResult(null);
		setCallError(null);
	};

	const fetchRooms = useCallback(async () => {
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
	}, []);

	useEffect(() => {
		fetchRooms();
	}, [fetchRooms]);

	const handleCreate = async () => {
		resetErrors();
		const isPasswordValid = isValidRoomPassword(createForm.password);
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
				max_participants: createForm.maxParticipants || DEFAULT_MAX_PARTICIPANTS,
				password: createForm.password || undefined,
			};
			const created = await createRoom(payload);
			setCreateResult(created);
			await handleJoin(created.room_number, passwordToUse);
			setCreateForm(buildInitialCreateForm(DEFAULT_MAX_PARTICIPANTS));
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
					<CreateRoomForm
						form={createForm}
						onChange={(next) =>
							setCreateForm((prev) => ({
								...prev,
								...next,
							}))
						}
						onSubmit={handleCreate}
						badge={createBadge}
						passwordHelper={ROOM_PASSWORD_HELPER}
						maxLimit={DEFAULT_MAX_PARTICIPANTS}
					/>
				</GlassPanel>

				<GlassPanel className="space-y-3">
					<header className="space-y-1">
						<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
							Join by Number
						</p>
						<h2 className="text-xl font-semibold text-slate-900">
							방 번호로 바로 입장
						</h2>
					</header>
					<JoinRoomForm
						form={joinForm}
						onChange={(next) =>
							setJoinForm((prev) => ({
								...prev,
								...next,
							}))
						}
						onSubmit={() => handleJoin(joinForm.roomNumber, joinForm.password)}
						passwordHelper={ROOM_PASSWORD_HELPER}
						badge={joinBadge}
						error={error}
						callError={callError}
					/>
				</GlassPanel>
			</div>

			<GlassPanel className="space-y-3">
				<RoomsList
					rooms={rooms}
					isLoading={isLoading}
					passwords={listPasswords}
					onPasswordChange={handleListPasswordChange}
					onJoin={(roomNumber, password) =>
						handleJoin(roomNumber, password || undefined)
					}
					onDelete={handleDelete}
					onRefresh={fetchRooms}
				/>
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
