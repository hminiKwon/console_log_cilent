export type RoomSummary = {
	room_number: string;
	title: string;
	need_password: boolean;
	created_at: string;
	max_participants: number;
};

export type RoomCreateRequest = {
	title: string;
	max_participants?: number;
	password?: string | null;
};

export type RoomCreateResponse = {
	room_number: string;
	title: string;
	need_password: boolean;
	janus_room_id: number;
};

export type RoomJoinRequest = {
	password?: string | null;
};

export type RoomJoinResponse = {
	room_number: string;
	title: string;
	need_password: boolean;
	janus_room_id: number;
};
