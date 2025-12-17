import type { CreateFormState } from "../model/forms";

type CreateRoomFormProps = {
	form: CreateFormState;
	onChange: (next: Partial<CreateFormState>) => void;
	onSubmit: () => void;
	badge?: string | null;
	passwordHelper: string;
	maxLimit: number;
};

export function CreateRoomForm({
	form,
	onChange,
	onSubmit,
	badge,
	passwordHelper,
	maxLimit,
}: CreateRoomFormProps) {
	return (
		<div className="space-y-3">
			<label className="block text-sm text-slate-700">
				제목
				<input
					value={form.title}
					onChange={(event) =>
						onChange({
							title: event.target.value,
						})
					}
					placeholder="예) 팀 스탠드업 / 동아리 회의"
					className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
				<label className="block text-sm text-slate-700">
					비밀번호 (선택)
					<input
						value={form.password}
						onChange={(event) =>
							onChange({
								password: event.target.value,
							})
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
						max={maxLimit}
						value={form.maxParticipants}
						onChange={(event) =>
							onChange({
								maxParticipants: Number(event.target.value),
							})
						}
						className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
					/>
				</label>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
				<span>최대 인원은 4명까지 지원합니다.</span>
				<button
					type="button"
					onClick={onSubmit}
					className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
				>
					방 생성
				</button>
			</div>
			{badge ? (
				<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
					{badge}
				</p>
			) : null}
		</div>
	);
}
