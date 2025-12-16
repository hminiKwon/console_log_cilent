import { httpClient } from "@/shared/api";
import type {
	RoomCreateRequest,
	RoomCreateResponse,
	RoomJoinRequest,
	RoomJoinResponse,
	RoomSummary,
} from "./types";

export async function listRooms() {
	const { data } = await httpClient.get<RoomSummary[]>("/rooms");
	return data;
}

export async function createRoom(payload: RoomCreateRequest) {
	const { data } = await httpClient.post<RoomCreateResponse>("/rooms", payload);
	return data;
}

export async function joinRoom(roomNumber: string, payload: RoomJoinRequest) {
	const { data } = await httpClient.post<RoomJoinResponse>(
		`/rooms/${roomNumber}/join`,
		payload
	);
	return data;
}

export async function deleteRoom(roomNumber: string) {
	await httpClient.delete(`/rooms/${roomNumber}`);
}

export type {
	RoomCreateRequest,
	RoomCreateResponse,
	RoomJoinRequest,
	RoomJoinResponse,
	RoomSummary,
};
