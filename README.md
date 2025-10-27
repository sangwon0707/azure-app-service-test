# recommend-your-product

Azure App Service에서 실행되는 FastAPI 백엔드와 Next.js 프론트엔드 풀스택 애플리케이션입니다.

## 프로젝트 구조

```
├── backend/
│   ├── main.py           # FastAPI 메인 파일
│   └── requirements.txt   # Python 의존성
├── frontend/
│   ├── pages/            # Next.js 페이지
│   ├── styles/           # CSS 모듈
│   ├── package.json      # Node.js 의존성
│   └── next.config.js    # Next.js 설정
├── startup.sh            # Azure 시작 스크립트
└── README.md
```

## 로컬에서 실행하기

### 백엔드 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

백엔드는 `http://localhost:8000`에서 실행됩니다.

### 프론트엔드 (Next.js)

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

- `GET /` - 환영 메시지
- `GET /api/health` - 헬스 체크
- `GET /api/products` - 모든 상품 조회
- `POST /api/recommend` - 필터를 기반으로 상품 추천
- `GET /api/products/{product_id}` - 특정 상품 조회

## Azure에 배포하기

### 1. Azure CLI를 이용한 배포

```bash
# Azure에 로그인
az login

# 리소스 그룹 생성
az group create --name recommend-rg --location eastasia

# App Service 계획 생성
az appservice plan create --name recommend-plan --resource-group recommend-rg --sku B1 --is-linux

# App Service 생성
az webapp create --resource-group recommend-rg --plan recommend-plan --name recommend-your-product --runtime "PYTHON|3.11"

# 코드 배포
git push azure main
```

### 2. 또는 VS Code Azure 확장 사용

1. VS Code에서 Azure 확장 설치
2. App Service 생성 또는 선택
3. 배포 버튼 클릭

### 3. 배포 후 설정

Azure Portal에서 App Service 구성:
- 시작 명령: `/home/site/wwwroot/startup.sh`
- 환경 변수: `NEXT_PUBLIC_API_BASE_URL=https://recommend-your-product.azurewebsites.net`

## 기능

- 전체 상품 목록 조회
- 카테고리별 필터링
- 가격대별 필터링
- 반응형 웹 디자인
- FastAPI를 이용한 고성능 백엔드 API

## 기술 스택

- **백엔드**: FastAPI, Python 3.11+
- **프론트엔드**: Next.js 14, React 18, TypeScript
- **배포**: Azure App Service
- **API 통신**: Axios

## 앞으로 확장할 수 있는 기능

- 데이터베이스 연동 (PostgreSQL, MongoDB 등)
- 사용자 인증 및 권한 관리
- 상품 검색 기능 강화
- AI 기반 개인화된 추천
- 장바구니 및 결제 기능
- 사용자 리뷰 및 평점

## 문제 해결

### 백엔드에 연결할 수 없음
- 백엔드 서버가 실행 중인지 확인
- 환경 변수 `NEXT_PUBLIC_API_BASE_URL` 확인
- CORS 설정 확인 (backend/main.py)

### 프론트엔드 빌드 실패
- Node.js 버전 확인 (14.x 이상)
- `npm install` 재실행
- `node_modules` 폴더 삭제 후 다시 설치

## 라이선스

MIT
