import type { JoinFormState } from "../model/forms";

type JoinRoomFormProps = {
	form: JoinFormState;
	onChange: (next: Partial<JoinFormState>) => void;
	onSubmit: () => void;
	passwordHelper: string;
	badge?: string | null;
	error?: string | null;
	callError?: string | null;
};

export function JoinRoomForm({
	form,
	onChange,
	onSubmit,
	passwordHelper,
	badge,
	error,
	callError,
}: JoinRoomFormProps) {
	return (
		<div className="flex flex-col space-y-3">
			<div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
				<label className="block text-sm text-slate-700">
					방 번호 (6자리)
					<input
						value={form.roomNumber}
						onChange={(event) =>
							onChange({
								roomNumber: event.target.value,
							})
						}
						maxLength={6}
						placeholder="예) 104200"
						className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
					/>
				</label>
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
						placeholder="있다면 입력"
						className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
					/>
				</label>
			</div>
			<div className="flex items-center justify-between text-xs text-slate-600">
				<span>{passwordHelper}</span>
				<button
					type="button"
					onClick={onSubmit}
					className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-500"
				>
					입장 시도
				</button>
			</div>
			{badge ? (
				<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
					{badge}
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
		</div>
	);
}
