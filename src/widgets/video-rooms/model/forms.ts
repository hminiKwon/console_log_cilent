export type CreateFormState = {
	title: string;
	password: string;
	maxParticipants: number;
};

export type JoinFormState = {
	roomNumber: string;
	password: string;
};

export const buildInitialCreateForm = (
	maxParticipants: number
): CreateFormState => ({
	title: "",
	password: "",
	maxParticipants,
});

export const buildInitialJoinForm = (): JoinFormState => ({
	roomNumber: "",
	password: "",
});
