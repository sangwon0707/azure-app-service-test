# Azure App Service 자동 배포 설정 가이드

## GitHub에서 Azure로 자동 배포 설정하기

### 방법 1: Azure Portal에서 설정 (권장)

1. **Azure Portal 접속**
   - https://portal.azure.com 접속
   - 만든 App Service `recommend-your-product` 선택

2. **배포 센터 설정**
   - 좌측 메뉴에서 "배포 센터" (Deployment Center) 클릭
   - 소스: GitHub 선택
   - GitHub 계정으로 로그인
   - 저장소: `sangwon0707/azure-app-service-test` 선택
   - 분기: `main` 선택
   - 빌드 공급자: GitHub Actions 선택
   - "저장" 클릭

3. **GitHub Actions 워크플로우 자동 생성**
   - Azure가 자동으로 GitHub Actions 워크플로우 파일 생성
   - `.github/workflows/` 디렉토리에 자동으로 커밋됨

### 방법 2: Azure CLI로 설정

```bash
# Azure에 로그인
az login

# App Service에 GitHub 배포 구성
az webapp deployment source config-zip \
  --resource-group <resource-group-name> \
  --name recommend-your-product \
  --src https://github.com/sangwon0707/azure-app-service-test.git

# 또는 GitHub Actions를 이용한 배포
az webapp deployment github-actions add \
  --resource-group <resource-group-name> \
  --name recommend-your-product \
  --repo sangwon0707/azure-app-service-test \
  --branch main
```

### 방법 3: 수동으로 GitHub Actions 워크플로우 생성

다음 파일을 리포지토리에 추가합니다:

**`.github/workflows/azure-deploy.yml`**

```yaml
name: Build and Deploy to Azure App Service

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install and build frontend
        run: |
          cd frontend
          npm install
          npm run build
          cd ..

      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          cd ..

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'recommend-your-product'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

## 필수 설정

### 1. Azure 게시 프로필 설정

1. Azure Portal에서 App Service 선택
2. "게시 프로필 다운로드" (Download publish profile) 클릭
3. GitHub 리포지토리 Settings → Secrets and variables → Actions
4. 새로운 secret 생성: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. 다운로드한 파일의 내용을 secret 값으로 입력

### 2. 시작 명령어 설정

Azure Portal App Service 구성에서:

- **스택**: Python 3.11
- **시작 명령어**: `/home/site/wwwroot/startup.sh`

또는 다음 명령어로 설정:

```bash
az webapp config set \
  --resource-group <resource-group-name> \
  --name recommend-your-product \
  --startup-file startup.sh
```

### 3. 환경 변수 설정

Azure Portal에서 App Service → 구성 → 응용 프로그램 설정:

```
NEXT_PUBLIC_API_BASE_URL = https://recommend-your-product.azurewebsites.net
PORT = 8000
```

## 배포 흐름

```
GitHub Push (main)
    ↓
GitHub Actions 트리거
    ↓
빌드 (Node.js + Python)
    ↓
Azure App Service에 배포
    ↓
startup.sh 실행
    ↓
백엔드 + 프론트엔드 실행
```

## 배포 상태 확인

### GitHub에서
- 리포지토리 → Actions 탭에서 워크플로우 실행 상태 확인

### Azure에서
- App Service → 배포 센터에서 배포 로그 확인
- "로그" (Logs) 탭에서 실시간 로그 확인

## 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. Azure App Service 로그 확인 (`az webapp log tail`)
3. 시작 명령어 확인
4. 환경 변수 확인

### 백엔드에 접속할 수 없을 때
- `NEXT_PUBLIC_API_BASE_URL` 확인
- CORS 설정 확인 (backend/main.py)
- 방화벽 규칙 확인

## 유용한 명령어

```bash
# 실시간 로그 보기
az webapp log tail --name recommend-your-product --resource-group <resource-group>

# 배포 상태 확인
az webapp deployment list --name recommend-your-product --resource-group <resource-group>

# App Service 재시작
az webapp restart --name recommend-your-product --resource-group <resource-group>
```

## 자동 배포 비활성화

GitHub Actions 워크플로우 파일을 삭제하거나 비활성화할 수 있습니다.
