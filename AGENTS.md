# Repository Guidelines

## 프로젝트 구조 및 모듈 구성
이 레포는 Next.js App Router + Feature-Sliced Design(FSD) 구조입니다. 소스는 `src/` 아래에 있으며
레이어별로 slice를 구성합니다.
- `src/app/`: 라우트 세그먼트, 레이아웃, 메타데이터.
- `src/widgets/`, `src/features/`, `src/entities/`, `src/processes/`, `src/shared/`: FSD 레이어와 slice.
- `src/types/`: 공용 TypeScript 타입.
- `public/`: 정적 자산.
의존성 흐름은 `shared → entities → features → widgets → app`을 유지하고, 각 slice는 `index.ts`
로 공개하며 필요 시 `ui/`, `model/`, `api/` 폴더를 둡니다.

## 빌드, 테스트, 개발 명령
- `npm install`: 의존성 설치.
- `npm run dev`: `.env.dev`로 로컬 개발 서버 실행 (`http://localhost:3000`).
- `npm run build`: `.env.prd`로 프로덕션 빌드.
- `npm run start`: 빌드 결과 실행.
- `npm run lint`: ESLint 검사.

## 코딩 스타일 및 네이밍
- TypeScript + React, Tailwind CSS 사용.
- 들여쓰기는 2칸, 문자열은 큰따옴표 사용.
- 컴포넌트는 PascalCase, 훅/유틸은 camelCase.
- slice 구조 예: `features/<slice>/ui`, `model`, `api`, `index.ts`.
- `src/` 내부는 `@/` 별칭으로 import (예: `@/shared/lib`).

## 테스트 가이드
테스트 러너는 아직 없습니다. 기본 검증은 `npm run lint`입니다.
테스트를 추가한다면 slice 옆에 배치하고 `*.test.ts`/`*.test.tsx`로 네이밍한 뒤 실행 스크립트를
추가하세요.

## 커밋 및 PR 가이드
- 커밋 형식: `type(scope): summary`.
- type: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `ci`, `build`, `perf`, `revert`.
- summary는 72자 이하, 명령형 문장, 한 커밋에 하나의 논리 변경만 포함.
- PR에는 변경 요약, 검증 방법, 관련 이슈 링크, UI 변경 시 스크린샷을 포함합니다.

## 환경 설정 및 보안
`.env.dev`, `.env.prd`는 gitignored입니다. 민감 정보는 해당 파일에만 보관하세요.
환경 선택 로직은 `src/shared/config/env.ts`, HTTP 설정은 `src/shared/api/http-client.ts`에서
관리합니다.
