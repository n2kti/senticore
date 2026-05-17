# SentiCore Cloudflare 배포

Cloudflare 대시보드에서 Pages 선택지가 보이지 않고 `npx wrangler versions upload` 같은 항목이 보이면, 현재 UI는 Workers 배포 흐름입니다. 이 프로젝트는 그 흐름에 맞게 **Workers + Static Assets** 방식으로 배포합니다.

앱 자체는 정적 React/Vite 화면이고, LLM 호출만 Worker의 `/api/llm`에서 처리합니다. DB, 로그인, 저장 기능, NAS Docker, Cloudflare Tunnel은 사용하지 않습니다.

## Cloudflare 설정값

GitHub repo: `n2kti/senticore`

| 항목 | 값 |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root path | `/` |
| Wrangler config | `wrangler.jsonc` |

## 환경변수

Cloudflare의 Variables/Secrets에 아래 값을 넣습니다.

| 변수 | 구분 | 값 |
| --- | --- | --- |
| `LLM_API_KEY` | Secret | Gemini API Key |
| `LLM_MODEL` | Variable | `gemini-2.5-flash` |

`LLM_API_KEY`는 절대 프론트 코드나 `.env`에 넣지 않습니다.

## 호출 구조

```txt
Browser
  -> /api/llm
  -> Cloudflare Worker
  -> Gemini API
```

정적 파일은 `dist`를 Worker Static Assets로 제공합니다. `/api/llm`만 Worker 코드가 처리하고, 나머지 요청은 정적 앱으로 전달합니다.

## 관련 파일

- `wrangler.jsonc`: Cloudflare Workers + Static Assets 배포 설정
- `worker/index.ts`: `/api/llm` 서버리스 API 및 정적 파일 서빙
- `src/lib/llmClient.ts`: 프론트의 `/api/llm` 호출 클라이언트
- `src/data/mockData.ts`: 더미 고객 데이터 5건

## 로컬 테스트

`npm run dev`는 Vite 화면만 띄우므로 `/api/llm` Worker가 실행되지 않습니다. AI 호출까지 로컬에서 확인하려면 아래 명령을 사용합니다.

```bash
npm run dev:worker
```

로컬에서도 `LLM_API_KEY`가 필요합니다. Cloudflare 배포 환경에서는 대시보드의 Secret으로 설정합니다.

## 필요 없는 것

- NAS 파일 업로드
- Dockerfile
- docker-compose.yml
- Cloudflare Tunnel
- 별도 Express/Node 서버
