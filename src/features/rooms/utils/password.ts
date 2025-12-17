export const isValidRoomPassword = (value: string) => {
	if (!value) return true;
	return /^[0-9]{4,6}$/.test(value);
};
