export type FortuneCalendar = "solar" | "lunar";
export type FortuneGender = "male" | "female";

export type FortuneRequest = {
	birth_date: string; // ISO date (YYYY-MM-DD)
	calendar: FortuneCalendar;
	gender: FortuneGender;
	birth_time?: number | null; // 0~11 (자~해), optional
};

export type FortuneResponse = {
	overall: string;
	wealth: string;
	business: string;
	career: string;
	love: string;
	wish: string;
	advice: string;
	score: number | null;
};
