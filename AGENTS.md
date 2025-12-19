# Console Log Client · Codex Agent Guide

## TL;DR
- Next.js 16(App Router) + React 19 + Tailwind v4 + TypeScript. 모든 페이지는 `src/app` 내부에서 `SidebarShell`(클라이언트 컴포넌트)로 감싼다.
- 레이어링은 Feature-Sliced Design(FSD)을 따른다: `shared → entities → features → widgets → app`. 각 슬라이스는 `index.ts`를 통해서만 외부에 노출한다.
- API 호출은 반드시 `src/shared/api/http-client.ts`(Axios)에 붙여야 하며, 여기서 Access Token 자동 부착·401 재시도·Refresh 흐름을 처리한다.
- 세션 상태는 `src/entities/session`의 Zustand 스토어가 담당한다. `sessionStorage` 기반이므로 인증 관련 훅은 모두 클라이언트 컴포넌트에서만 사용한다.
- 실험/도구 페이지는 대부분 클라이언트 전용 UI이며, `/rooms`는 Janus WebRTC, `/ai-chatbot`은 보호된 챗봇, `/fortune`·`/json-formatter`·`/text-encoder`는 공개 도구다.

---

## 개발 명령어
- `npm install` – 의존성 설치.
- `npm run dev` – `.env.dev`를 로드한 개발 서버(기본 3000번 포트). Next.js 16 요구사항에 따라 Node 18.18+ 또는 20+ 사용 권장.
- `npm run build` – `.env.prd` 로드 후 프로덕션 빌드.
- `npm run start` – 빌드 산출물을 `.env.prd`로 서비스.
- `npm run lint` – `eslint.config.mjs`(Next core-web-vitals + TS 설정) 실행. PR 전에 필수.

> 스크립트는 `dotenv-cli`를 사용하므로 환경파일이 없으면 실행이 중단된다.

---

## 환경 변수 & API 백엔드
- 루트에 `.env.dev`, `.env.prd`를 두고 README에 있는 예시 값(`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_API_BASE_URL`)을 채운다.
- WebRTC/Janus용 변수가 추가로 필요하다:
  - `NEXT_PUBLIC_SIGNALING_WS_URL`, `NEXT_PUBLIC_SIGNALING_WS_PROTOCOL`
  - `NEXT_PUBLIC_TURN_URL`, `NEXT_PUBLIC_TURN_USERNAME`, `NEXT_PUBLIC_TURN_CREDENTIAL`
- `src/shared/config/env.ts`가 위 변수를 읽어 `env` 객체로 노출한다. 클라이언트 코드에서 직접 `process.env`를 참조하지 말고 `env`만 사용한다.
- 백엔드 엔드포인트 기대치:
  - `POST /auth/login` – 비밀번호는 `hashPassword`로 SHA-256 해싱 후 전달.
  - `POST /auth/logout`, `POST /auth/refresh`.
  - `GET /rooms`, `POST /rooms`, `POST /rooms/:roomNumber/join`, `DELETE /rooms/:roomNumber`.
  - `POST /ai/chat`, `POST /fortune/today`.
- `httpClient`는 `withCredentials: true`로 Refresh Token 쿠키 교환을 활성화하고, 401 발생 시 `auth/refresh`를 한번 더 호출한 뒤 재시도한다.

---

## 프로젝트 구조(Feature-Sliced)
- `src/app` – Next.js App Router 세그먼트. 각 `page.tsx`는 가능한 한 얇게 유지하고, 레이아웃은 `widgets`를 조합한다.
- `src/widgets` – 페이지 단위 조합. 예: `video-rooms`, `auth`, `dashboard`, `sidebar`.
- `src/features` – 사용자 기능 단위. API 클라이언트/훅/UI를 한 슬라이스 아래에 둔다. 예: `features/rooms`, `features/auth`, `features/json-formatter`.
- `src/entities` – 재사용 가능한 도메인 모델(세션, 네비게이션, 지표 등).
- `src/shared` – 공용 라이브러리(`cn`, `getHttpErrorMessage`, `hashPassword`, `formatJson`), API, 환경설정, UI 프리미티브(`GlassPanel`).
- `src/processes` – 복수 페이지에 걸친 플로우를 넣을 자리(현재 README만 존재).
- `src/types` – 써드파티 타입 보강(`janus-gateway` 선언).
- 경로 별칭 `@/*` → `src/*` (`tsconfig.json`).

### 작업 시 기본 규칙
1. 새 기능은 `features/<name>` 밑에 `ui/`, `model/`, `api/` 폴더와 `index.ts`를 추가하고, `widgets`나 `app`에서는 `features`의 `index.ts`를 통해서만 import.
2. 엔티티/공유 레이어로 내릴 수 있는 로직은 내려서 재사용성 확보.
3. 페이지에 클라이언트 훅이 필요하면 `widgets`에서만 `use client` 선언. `app` 경로 파일은 가능하면 서버 컴포넌트 유지.

---

## 주요 기능 요약

### 인증 & 세션
- `features/auth/api/login.ts` – SHA-256 해시 후 `/auth/login` 요청, 성공 시 `accessTokenStore`에 토큰 저장.
- `features/auth/api/logout.ts` – `/auth/logout` 호출 실패 시에도 스토어 초기화.
- `entities/session/model/access-token-store.ts` – Zustand + `sessionStorage` `persist`. `hasHydrated` 플래그가 있으니 UI에서 반드시 확인 후 렌더링.
- 보호 컴포넌트
  - `widgets/protected`의 `ProtectedGate` – 비로그인 접근 시 로그인 CTA 표시.
  - `widgets/auth/login-redirect-gate.tsx` – 로그인 상태에서 `/login` 접근 시 홈으로 리다이렉트.
  - `widgets/sidebar` – 로그인 상태에 따라 버튼/메뉴 필터링.

### 화상 룸(WebRTC / Janus)
- `features/rooms/api` – 방 목록/생성/입장/삭제 API 래핑. `RoomSummary`, `RoomJoinResponse` 등의 타입 포함.
- `features/rooms/lib/use-janus-call.ts` – Janus WebRTC 클라이언트 래퍼.
  - `env.signalingWsUrl`이 비어 있으면 즉시 오류를 띄움.
  - `buildIceServers`(`features/rooms/lib/janus-ice.ts`)가 Google STUN + TURN 설정을 구성.
  - 클린업 루틴을 내부에서 갖고 있으나, UI (`CallPanel`)가 언마운트될 때 `handleLeave`를 호출해야 리소스가 해제된다.
- `widgets/video-rooms`
  - `VideoRoomsExperience` – 생성/입장/목록/통화 상태를 하나의 화면으로 관리.
  - `CreateRoomForm` & `JoinRoomForm` – 숫자 4~6자리 비밀번호 검증(`isValidRoomPassword`).
  - `CallPanel` – 로컬/원격 스트림 타일(`VideoTile`) 렌더링, 통화 종료 버튼에서 `handleLeave`.
  - `RoomsList` – 목록 갱신/삭제/입장 UI. `listRooms` 실패 시 에러 메시지 출력.

### 도구 & 실험 페이지
- `/fortune` → `features/fortune`
  - `useTodayFortune` 훅이 입력/결과 상태 및 로딩을 관리하고 `fetchTodayFortune`을 호출한다.
  - 에러 메시지는 `getHttpErrorMessage`를 통해 서버 응답을 친화적으로 변환.
- `/json-formatter` → `features/json-formatter`
  - `formatJson`을 사용해 JSON 문자열을 prettify. 실패 시 사용자 피드백 제공.
- `/text-encoder` → `features/text-encoder`
  - `encodeValue`로 Base64/URL/SHA-256 인코딩을 지원. `navigator.clipboard` 사용 시 예외는 무시.
- `/ai-chatbot` → `features/ai-chat`
  - `sendChat`이 `/ai/chat`으로 메시지를 전송, `reply` 필드가 없으면 `message`를 폴백. `ProtectedGate`로 로그인 사용자만 접근.

### 레이아웃 & 내비게이션
- `widgets/sidebar` – 모바일 드로어 + 데스크톱 고정 사이드바를 동시에 지원. `SidebarNav`가 `entities/navigation` 데이터를 기반으로 메뉴를 만든다.
- `widgets/dashboard` – 루트 페이지(콘솔 소개 + 퀵 링크) 구성. `GlassPanel` UI 토큰을 재사용.
- 공통 UI는 `src/shared/ui/glass-panel.tsx` 하나로 시작하지만 필요 시 여기에서 추가한다.

---

## 스타일 & UI 가이드
- Tailwind CSS v4 스타일 시트는 `src/app/globals.css` 최상단에서 `@import "tailwindcss";` 방식으로 포함된다. 유틸 클래스를 우선 사용하고, 반드시 `GlassPanel`/`cn` 유틸을 통해 일관된 룩앤필을 유지한다.
- Google Fonts(Geist, Geist Mono)는 `app/layout.tsx`에서 로드하므로 글로벌 폰트 토큰을 재정의하지 말 것.
- Tailwind 미지원 속성은 CSS 변수나 inline-style이 아닌 커스텀 클래스에서 정의하는 것을 권장.

---

## 작업 루틴 & 품질 체크
1. 필요한 `.env.*` 값을 확인하고 `npm run dev`로 앱을 띄워 페이지별 수동 QA 진행.
2. WebRTC 기능을 만질 때는 로컬 HTTPS + 실제 카메라/마이크 권한이 필요하니 브라우저 권한 상태를 반드시 확인.
3. 변경 후 `npm run lint`로 정적 분석을 돌려 App Router 규칙 위반을 조기에 발견.
4. 자동 테스트가 없으므로 주요 플로우(로그인→보호 페이지, 방 생성→입장→종료, JSON/텍스트 도구 실행)를 직접 검증한다.

---

## 주의사항 / 미해결 항목
- `src/app/board`, `gallery`, `lab` 폴더는 현재 비어 있는 placeholder다. 새 페이지 추가 시 여기에 `page.tsx`를 배치하거나 폴더를 제거.
- `hashPassword`는 Web Crypto API(`crypto.subtle`)에 의존하므로 브라우저 HTTPS 환경이 아니면 실패한다. 서버 액션이나 Node 런타임에서는 사용 불가.
- `accessTokenStore`는 `sessionStorage`를 쓰므로 SSR에서 접근할 수 없다. 항상 `hasHydrated` 체크 후 렌더링.
- Janus 관련 타입은 `src/types/janus-gateway.d.ts`의 매우 느슨한 선언을 쓰고 있다. 정밀 타입이 필요하면 보완해야 한다.
- 패키지 잠금은 npm(`package-lock.json`). 다른 패키지 매니저 사용 금지.

---

## 유용한 파일 레퍼런스
- `package.json` – 스크립트 & 의존성 정의.
- `next.config.ts` – React Compiler + `cacheComponents` 활성화.
- `src/widgets/sidebar/ui/sidebar-nav.tsx` – 내비게이션 + 로그아웃 처리 참고.
- `src/features/auth/ui/login-form.tsx` – 폼 패턴과 에러 핸들링 스타일 참고.
- `src/widgets/video-rooms/ui/video-rooms-experience.tsx` – 복합 상태 관리 예시.
- `README.md` – 레이어 규칙과 커밋 컨벤션(`type(scope): summary`) 요약.

이 문서를 최신 상태로 유지하면 추후 Codex 에이전트들이 맥락을 빠르게 파악하고 연속 작업을 이어갈 수 있다.
