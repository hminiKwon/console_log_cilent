import { useJanusCall, type RoomJoinResponse } from "@/features/rooms";
import { GlassPanel } from "@/shared/ui";
import { VideoTile } from "./video-tile";

type CallPanelProps = {
	room: RoomJoinResponse;
	onLeave: () => void;
	onError: (message: string) => void;
};

export function CallPanel({ room, onLeave, onError }: CallPanelProps) {
	const { status, localStream, remoteStreams, handleLeave } = useJanusCall({
		room,
		onError,
	});

	const remoteIds = Object.keys(remoteStreams);

	const leave = () => {
		handleLeave();
		onLeave();
	};

	return (
		<GlassPanel className="space-y-3 bg-white">
			<header className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
						Live Call
					</p>
					<h3 className="text-xl font-semibold text-slate-900">
						방 {room.room_number} · Janus #{room.janus_room_id}
					</h3>
					<p className="text-sm text-slate-600">
						{status}{" "}
						{!localStream ? "(내 영상 수신 대기 중... 카메라 권한 확인)" : ""}
					</p>
				</div>
				<button
					type="button"
					onClick={leave}
					className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
				>
					통화 종료
				</button>
			</header>

			<div className="grid gap-3 md:grid-cols-2">
				<VideoTile label="나" stream={localStream} isLocal />
				{remoteIds.length === 0 ? (
					<div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-600">
						다른 참가자가 입장하면 여기에 표시됩니다.
					</div>
				) : null}
				{remoteIds.map((id) => (
					<VideoTile
						key={id}
						label={`Peer ${id.slice(-4)}`}
						stream={remoteStreams[id]}
					/>
				))}
			</div>
		</GlassPanel>
	);
}
