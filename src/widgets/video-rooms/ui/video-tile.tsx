import { useEffect, useRef } from "react";

type VideoTileProps = {
	label: string;
	stream: MediaStream | null;
	isLocal?: boolean;
};

export function VideoTile({ label, stream, isLocal }: VideoTileProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
			videoRef.current
				.play()
				.catch(() => {
					/* 모바일 브라우저 등에서 자동재생 차단 시 무시 */
				});
		}
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
