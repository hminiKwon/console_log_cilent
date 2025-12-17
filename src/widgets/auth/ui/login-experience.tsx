import { LoginForm, LOGIN_HIGHLIGHTS } from "@/features/auth";
import { GlassPanel } from "@/shared/ui";

export function LoginExperience() {
	return (
		<section className="space-y-6">
			<div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
				<HeroPanel />
				<LoginForm />
			</div>
		</section>
	);
}

function HeroPanel() {
	return (
		<GlassPanel className="flex h-full flex-col justify-between bg-linear-to-br from-white via-emerald-50 to-sky-50 p-8 text-slate-900">
			<div className="space-y-4">
				<p className="text-xs uppercase tracking-[0.5em] text-emerald-700">
					Login
				</p>
				<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
					로그인 하나로
					<br />홈 전체를 여는 경험
				</h1>
				<p className="text-base text-slate-600">
					현재는 새 계정 생성이 불가능 합니다.
				</p>
				<div className="flex flex-wrap gap-3">
					{/* <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
						새 계정 만들기
					</button> */}
					{/* <button className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50">
						지원 센터
					</button> */}
				</div>
			</div>
			<div className="mt-8 space-y-3">
				{LOGIN_HIGHLIGHTS.map((item) => (
					<div
						key={item.title}
						className="rounded-2xl border border-emerald-100 bg-white px-5 py-4"
					>
						<p className="text-sm font-semibold text-slate-900">{item.title}</p>
						<p className="text-sm text-slate-600">{item.desc}</p>
					</div>
				))}
			</div>
		</GlassPanel>
	);
}
