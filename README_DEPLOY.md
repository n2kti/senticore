# SentiCore Cloudflare Pages 배포

이 프로젝트는 정적 React/Vite 웹 앱입니다. 화면 데이터는 `src/data/mockData.ts`의 더미데이터 5건만 사용하며, DB/로그인/저장 기능은 없습니다.

LLM 호출만 Cloudflare Pages Functions의 `/api/llm`을 통해 처리합니다. API Key는 프론트 코드나 번들에 포함하지 않고 Cloudflare 환경변수로만 설정합니다.

## 배포 설정값

Cloudflare Pages 프로젝트 생성 시 아래 값으로 설정합니다.

| 항목 | 값 |
| --- | --- |
| Framework preset | `Vite` 또는 `React/Vite` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Functions directory | `functions` |
| Node.js version | `20` 이상 권장 |

## 환경변수

Cloudflare Pages의 `Settings > Environment variables`에서 설정합니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `LLM_API_KEY` | 예 | Gemini API Key |
| `LLM_MODEL` | 예 | Gemini 모델명 |

예시:

```txt
LLM_API_KEY=실제 Gemini API Key
LLM_MODEL=gemini-2.5-flash
```

## 호출 구조

```txt
Browser
  -> /api/llm
  -> Cloudflare Pages Functions
  -> Gemini API
```

프론트 코드는 `/api/llm`만 호출합니다. Provider API Key는 `functions/api/llm.ts`에서 Cloudflare 환경변수로만 읽습니다.

## 로컬 파일 주의

- 실제 키는 `.env`, `.env.local`, `src`에 넣지 않습니다.
- `.env.example`만 샘플로 유지합니다.
- `.gitignore`는 `.env*`를 제외하고 `.env.example`만 허용합니다.

## 필요 없는 파일

현재 구조에서는 아래 파일이 필요 없습니다.

- `Dockerfile`
- `docker-compose.yml`
- NAS 배포 스크립트
- Cloudflare Tunnel 설정 파일
- 별도 Express/Node API 서버 파일

현재 저장소에는 위 파일을 추가하지 않습니다.
