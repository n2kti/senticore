# SentiCore

SentiCore는 저축은행 채권관리 상담원을 위한 상담보조 대시보드입니다.

화면은 React/Vite 정적 웹으로 구성하고, 고객/계좌/접촉 이력은 더미데이터 5건만 사용합니다. DB, 로그인, 저장 기능은 없습니다.

LLM 호출은 프론트에서 직접 하지 않고 Cloudflare Worker의 `/api/llm`을 통해 처리합니다. Gemini API Key는 Cloudflare Secret 또는 로컬 `.dev.vars`에만 둡니다.

## 로컬 실행

의존성 설치:

```bash
npm install
```

화면만 확인:

```bash
npm run dev
```

AI 호출까지 확인:

```bash
npm run dev:worker
```

`npm run dev:worker`를 사용할 때는 `.dev.vars`에 아래 값을 설정합니다.

```txt
LLM_API_KEY=Gemini API Key
LLM_MODEL=gemini-2.5-flash
```

## 배포

Cloudflare Workers + Static Assets 방식으로 배포합니다.

자세한 설정은 [README_DEPLOY.md](README_DEPLOY.md)를 확인하세요.
