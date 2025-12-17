import { useEffect, useRef } from "react";

type VideoTileProps = {
	label: string;
	stream: MediaStream | null;
	isLocal?: boolean;
};

export function VideoTile({ label, stream, isLocal }: VideoTileProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (video) {
			if (stream) {
				video.srcObject = stream;
				video.play().catch(() => {
					/* 모바일 브라우저 등에서 자동재생 차단 시 무시 */
				});
			} else {
				// 스트림이 사라진 경우 srcObject를 명시적으로 해제
				try {
					video.pause();
				} catch {
					/* noop */
				}
				try {
					(video as any).srcObject = null;
				} catch {
					/* noop */
				}
			}
		}

		return () => {
			// 언마운트 시에도 재생 중지 및 srcObject 해제
			const v = videoRef.current;
			if (v) {
				try {
					v.pause();
				} catch {
					/* noop */
				}
				try {
					(v as any).srcObject = null;
				} catch {
					/* noop */
				}
			}
		};
	}, [stream]);

	return (
		<div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={isLocal}
				className="h-full w-full object-cover"
			/>
			<div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
				{label}
			</div>
		</div>
	);
}
