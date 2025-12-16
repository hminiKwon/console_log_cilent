export type SignalEvent =
	| {
			type: "joined";
			peerId: string;
			peers: string[];
	  }
	| { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
	| { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
	| { type: "ice"; from: string; candidate: RTCIceCandidateInit }
	| { type: "leave"; peerId: string }
	| { type: "error"; message: string };

type OutgoingMessage =
	| {
			type: "join";
			roomNumber: string;
			peerId: string;
			janusRoomId: number;
			transaction?: string;
	  }
	| {
			type: "offer";
			to: string;
			from: string;
			sdp: RTCSessionDescriptionInit;
			transaction?: string;
	  }
	| {
			type: "answer";
			to: string;
			from: string;
			sdp: RTCSessionDescriptionInit;
			transaction?: string;
	  }
	| {
			type: "ice";
			to: string;
			from: string;
			candidate: RTCIceCandidateInit;
			transaction?: string;
	  }
	| { type: "leave"; peerId: string; roomNumber: string; transaction?: string };

type SignalingHandlers = {
	onEvent: (event: SignalEvent) => void;
};

/**
 * 최소한의 WebSocket 기반 시그널링 클라이언트.
 * 서버 메시지 포맷은 OutgoingMessage/SignalEvent를 참고해 맞춰주세요.
 */
export class SignalingClient {
	private ws: WebSocket | null = null;
	private readonly url: string;
	private readonly roomNumber: string;
	private readonly janusRoomId: number;
	private readonly peerId: string;
	private readonly handlers: SignalingHandlers;
	private readonly protocol?: string;

	constructor(
		url: string,
		params: {
			roomNumber: string;
			janusRoomId: number;
			peerId: string;
		},
		handlers: SignalingHandlers,
		protocol?: string
	) {
		this.url = url;
		this.roomNumber = params.roomNumber;
		this.janusRoomId = params.janusRoomId;
		this.peerId = params.peerId;
		this.handlers = handlers;
		this.protocol = protocol;
	}

	connect() {
		this.ws = this.protocol
			? new WebSocket(this.url, this.protocol)
			: new WebSocket(this.url);
		this.ws.onopen = () => {
			this.send({
				type: "join",
				roomNumber: this.roomNumber,
				peerId: this.peerId,
				janusRoomId: this.janusRoomId,
			});
		};

		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as SignalEvent;
				this.handlers.onEvent(data);
			} catch (error) {
				this.handlers.onEvent({
					type: "error",
					message: "시그널 메시지를 파싱할 수 없습니다.",
				});
			}
		};

		this.ws.onerror = () => {
			this.handlers.onEvent({
				type: "error",
				message: "시그널링 서버 연결 오류가 발생했습니다.",
			});
		};

		this.ws.onclose = () => {
			this.ws = null;
		};
	}

	send(message: OutgoingMessage) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			const enriched: OutgoingMessage =
				"transaction" in message && message.transaction
					? message
					: {
							...message,
							transaction: crypto.randomUUID(),
					  };
			this.ws.send(JSON.stringify(enriched));
		}
	}

	sendOffer(to: string, sdp: RTCSessionDescriptionInit) {
		this.send({ type: "offer", to, from: this.peerId, sdp });
	}

	sendAnswer(to: string, sdp: RTCSessionDescriptionInit) {
		this.send({ type: "answer", to, from: this.peerId, sdp });
	}

	sendIce(to: string, candidate: RTCIceCandidateInit) {
		this.send({ type: "ice", to, from: this.peerId, candidate });
	}

	leave() {
		this.send({ type: "leave", peerId: this.peerId, roomNumber: this.roomNumber });
		this.ws?.close();
	}
}
