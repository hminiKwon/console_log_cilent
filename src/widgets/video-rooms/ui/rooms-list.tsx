import type { RoomSummary } from "@/features/rooms";

type RoomsListProps = {
	rooms: RoomSummary[];
	isLoading: boolean;
	passwords: Record<string, string>;
	onPasswordChange: (roomNumber: string, value: string) => void;
	onJoin: (roomNumber: string, password?: string) => void;
	onDelete: (roomNumber: string) => void;
	onRefresh: () => void;
};

export function RoomsList({
	rooms,
	isLoading,
	passwords,
	onPasswordChange,
	onJoin,
	onDelete,
	onRefresh,
}: RoomsListProps) {
	return (
		<>
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
					onClick={onRefresh}
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
						const passwordValue = passwords[room.room_number] ?? "";
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
										onClick={() => onDelete(room.room_number)}
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
												onPasswordChange(room.room_number, event.target.value)
											}
											maxLength={6}
											placeholder="비밀번호"
											className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
										/>
									) : (
										<div className="text-xs text-emerald-700">비밀번호 없음</div>
									)}
									<button
										type="button"
										onClick={() =>
											onJoin(room.room_number, passwordValue || undefined)
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
		</>
	);
}
