## Console Log Client

Next.js 14 (App Router) + TypeScript playground that now follows Feature-Sliced Design (FSD) for predictable growth.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript / ESLint (core-web-vitals)
- Tailwind CSS (via `globals.css`)

## Directory Layout (FSD)

```
src/
├─ app/                # Next.js routes, layouts, metadata
├─ processes/          # Cross-page business flows (optional)
├─ widgets/            # Page-level sections (Hero, Sidebar, etc.)
├─ features/           # User-facing functionality (LoginButton, Filters, ...)
├─ entities/           # Reusable domain models (User, Project, ...)
└─ shared/
   ├─ api/             # API clients, DTO helpers
   ├─ config/          # Runtime configuration, constants
   ├─ lib/             # Utilities and adapters
   ├─ styles/          # Global tokens, mixins
   └─ ui/              # Pure UI primitives
```

### Layer Rules
1. Dependencies flow upward: `shared → entities → features → widgets → app/pages`.
2. Even inside a layer, expose only an explicit public API (`index.ts`, `model`, `api`) per slice.
3. Keep route segments (`src/app/**`) dependent on widgets/features, not on bare entities.

### Slice Template (Suggested)

```
<layer>/<slice>/
├─ ui/        # React components
├─ model/     # Hooks, stores, entity adapters
├─ api/       # Server actions, fetchers
└─ index.ts   # Public entry point
```

## Development

```bash
npm install
npm run dev         # http://localhost:3000 (loads .env.dev)
npm run build       # uses .env.prd
npm run start       # serves built app with .env.prd
npm run lint
```

Create new slices under the appropriate layer and import them through the `@/` alias (which maps to `src/`).

## Commit Convention

- 형식: `type(scope): summary` (scope는 선택). 예) `feat(board): add glass panel layout`.
- 사용 가능한 `type`: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `ci`, `build`, `perf`, `revert`.
- Summary는 72자 이하, 명령형 동사 사용. 추가 설명이 필요하면 본문에 작성하고, breaking change는 `BREAKING CHANGE:`로 별도 표기.
- 하나의 커밋은 하나의 논리 변경만 포함하고, 관련 테스트/문서를 함께 갱신합니다.

## Environment & API

1. 루트에 `.env.dev`, `.env.prd` 파일을 만들고 각각 `.env.dev.example`, `.env.prd.example` 내용을 복사한 뒤 값을 채워주세요.
   ```
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_API_BASE_URL_DEV=http://localhost:4000
   NEXT_PUBLIC_API_BASE_URL_PRD=https://api.console-log.com
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000  # dev fallback 예시
   ```
2. `src/shared/config/env.ts`가 현재 실행 환경(dev/prd)에 맞는 API 베이스 URL을 계산합니다.
3. `src/shared/api/http-client.ts`는 Axios 인스턴스를 생성해
   - `withCredentials: true`로 Refresh Token(HttpOnly 쿠키) 교환
   - `Authorization: Bearer <accessToken>` 헤더 자동 부착
4. `src/entities/session/model/access-token-store.ts` (Zustand)이 Access Token을 중앙 관리하며, 로그인 성공 시 `features/auth/api/login.ts`에서 토큰을 저장합니다.
