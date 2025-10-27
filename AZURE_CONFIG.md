# Azure App Service 배포 설정 (최종 버전)

이 문서는 `dev-astra.tistory.com/729`의 가이드를 바탕으로 Azure App Service에 배포하는 방법을 설명합니다.

## 🔑 핵심 포인트

**Azure App Service는 기본적으로 포트 8080을 사용합니다!**

따라서 프론트엔드는 포트 8080에서 실행되어야 합니다.

---

## 📋 프로젝트 구조

```
azure-app-test02/
├── frontend/
│   ├── pages/              # Next.js 페이지
│   ├── styles/             # CSS 스타일
│   ├── public/             # 정적 파일
│   ├── .next/              # Next.js 빌드 결과
│   ├── server.js           # 커스텀 서버 (포트 8080)
│   ├── next.config.js      # Next.js 설정 (standalone 모드)
│   ├── package.json        # npm 의존성
│   ├── .env.local          # 개발용 환경 변수
│   └── .env.production     # 프로덕션용 환경 변수
├── backend/
│   ├── main.py             # FastAPI 애플리케이션
│   └── requirements.txt     # Python 의존성
├── startup.sh              # Azure 시작 스크립트
└── README.md
```

---

## ⚙️ 중요 설정 파일

### 1. `frontend/next.config.js` - Standalone 모드 활성화
```javascript
const nextConfig = {
  output: 'standalone',  // ← 이 설정이 중요!
  ...
}
```

### 2. `frontend/server.js` - 포트 8080 설정
```javascript
const PORT = process.env.PORT || 8080  // ← Azure 기본 포트
```

### 3. `frontend/package.json` - Start 스크립트
```json
{
  "scripts": {
    "start": "node server.js"  // ← 커스텀 server.js 실행
  }
}
```

### 4. `startup.sh` - 시작 명령어
```bash
PORT=8080 npm start      # 프론트엔드 포트 8080
PORT=8000 python main.py # 백엔드 포트 8000
```

---

## 🚀 Azure Portal 배포 단계

### Step 1: Azure Portal 접속 및 App Service 선택
1. https://portal.azure.com 접속
2. 검색창에 `recommend-your-product` 입력
3. App Service 클릭

### Step 2: 배포 센터 설정
1. 좌측 메뉴 → **배포** → **배포 센터**
2. **소스**: GitHub 선택
3. GitHub으로 로그인
4. **저장소**: `sangwon0707/azure-app-service-test`
5. **분기**: `main`
6. **빌드 공급자**: GitHub Actions
7. **저장** 클릭

### Step 3: 구성 설정
1. **설정** → **구성** 클릭

#### 일반 설정 (General settings)
- **시작 명령어**: `/home/site/wwwroot/startup.sh`

#### 응용 프로그램 설정 (Application settings)
| 이름 | 값 |
|-----|-----|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` |
| `PORT` | `8080` |
| `WEBSITES_PORT` | `8080` |

#### 스택 설정 (Stack settings)
- **Python version**: 3.11
- **Node.js version**: 18

### Step 4: 저장 및 배포 실행
1. 모든 설정 **저장** 클릭
2. GitHub Actions가 자동으로 실행됨
3. GitHub 리포지토리 → **Actions** 탭에서 상태 확인

---

## 🔍 배포 로그 확인

### Azure Portal에서 확인
1. App Service → **모니터링** → **Log Stream**
2. 실시간 로그 확인

### GitHub Actions에서 확인
1. 리포지토리 → **Actions** 탭
2. 워크플로우 실행 상황 확인

### SSH로 접속하여 로그 확인
```bash
# Azure Portal에서 SSH 열기
# 또는 아래 명령어로 원격 로그 보기
az webapp log tail --name recommend-your-product --resource-group <resource-group>
```

---

## ✅ 배포 확인 체크리스트

- [ ] GitHub 리포지토리에 모든 코드 푸시 완료
- [ ] Azure App Service 생성 완료
- [ ] 배포 센터에서 GitHub 연동 완료
- [ ] `startup.sh` 파일이 실행 권한을 가지고 있음
- [ ] `next.config.js`에 `output: 'standalone'` 설정
- [ ] `frontend/server.js` 파일 존재
- [ ] `package.json` start 스크립트가 `node server.js`
- [ ] 환경 변수 설정 완료 (`PORT=8080`)
- [ ] GitHub Actions 배포 성공
- [ ] https://recommend-your-product.azurewebsites.net 접속 가능

---

## 🐛 문제 해결

### 배포가 진행되지 않음
```bash
# 원인: GitHub secret이 설정되지 않음
# 해결: Azure Portal → 배포 센터 → 재설정
```

### "Cannot find module 'next'"
```bash
# 원인: npm install이 제대로 되지 않음
# 해결: startup.sh의 npm install 확인
```

### 포트 에러 (Port already in use)
```bash
# 원인: 이전 프로세스가 종료되지 않음
# 해결: Azure Portal에서 App Service 재시작
```

### API 요청 실패
```bash
# 원인: NEXT_PUBLIC_API_BASE_URL이 잘못됨
# 해결: .env.production 확인
# localhost:8000이 맞는지 확인
```

### Frontend가 보이지 않음 (500 에러)
```bash
# 확인 항목:
# 1. server.js가 제대로 실행되고 있는지 확인
# 2. PORT=8080이 설정되어 있는지 확인
# 3. next.config.js의 standalone 모드 확인
```

---

## 📚 참고 자료

- [dev-astra 블로그](https://dev-astra.tistory.com/729)
- [Azure App Service 공식 문서](https://learn.microsoft.com/en-us/azure/app-service/)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

## 💡 최종 배포 흐름

```
1. GitHub에 코드 푸시
        ↓
2. GitHub Actions 트리거
        ↓
3. npm install && npm run build (프론트엔드)
        ↓
4. pip install (백엔드)
        ↓
5. Azure App Service에 배포
        ↓
6. startup.sh 실행
        ↓
7a. npm start (포트 8080) → Next.js 시작
7b. python main.py (포트 8000) → FastAPI 시작
        ↓
8. https://recommend-your-product.azurewebsites.net 접속 가능!
```
