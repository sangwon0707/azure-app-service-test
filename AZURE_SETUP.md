# Azure App Service + GitHub 자동 배포 설정 가이드

## ⚠️ 현재 상황
Azure App Service가 생성되었지만 코드가 배포되지 않았습니다.
이를 해결하기 위해 GitHub와 Azure를 연동해야 합니다.

---

## 방법 1: Azure Portal 배포 센터로 설정 (가장 간단!)

### 1단계: Azure Portal 접속
1. https://portal.azure.com 접속
2. 검색창에 `recommend-your-product` 입력
3. App Service 클릭

### 2단계: 배포 센터 설정
1. 좌측 메뉴에서 **배포** → **배포 센터** 클릭
2. **소스** 섹션:
   - **소스**: `GitHub` 선택
   - GitHub 계정으로 로그인 (팝업 창)

### 3단계: GitHub 저장소 선택
1. **소유자**: `sangwon0707` 선택
2. **저장소**: `azure-app-service-test` 선택
3. **분기**: `main` 선택
4. **저장** 클릭

### 4단계: 빌드 제공자 선택
- **GitHub Actions** 선택 후 **저장** 클릭
- Azure가 자동으로 GitHub Actions 워크플로우를 생성하고 커밋합니다

### 5단계: 배포 확인
- GitHub 리포지토리 → **Actions** 탭에서 자동 배포 시작
- 배포 완료 후 https://recommend-your-product.azurewebsites.net 접속

---

## 방법 2: 수동으로 GitHub Secret 설정

### Step 1: Azure에서 게시 프로필 다운로드
1. Azure Portal → `recommend-your-product` App Service
2. 우측 상단 **게시 프로필 다운로드** 클릭
3. `.PublishSettings` 파일 저장

### Step 2: GitHub Secret 설정
1. GitHub 리포지토리 → **Settings** (설정)
2. 좌측 메뉴 → **Secrets and variables** → **Actions**
3. **New repository secret** 클릭
4. **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. **Secret**: 다운로드한 `.PublishSettings` 파일 내용을 복사해서 붙여넣기
6. **Add secret** 클릭

### Step 3: GitHub Actions 실행
1. GitHub 리포지토리 → **Actions** 탭
2. `Build and Deploy to Azure App Service` 워크플로우 선택
3. **Run workflow** → **Run workflow** 클릭
4. 배포 시작

### Step 4: 배포 로그 확인
- GitHub Actions 탭에서 실시간으로 배포 상태 확인
- 완료 후 https://recommend-your-product.azurewebsites.net 접속

---

## 방법 3: Azure 배포 센터에서 GitHub Actions 재설정

### 자동 워크플로우가 제대로 생성되지 않은 경우:

1. Azure Portal → `recommend-your-product` App Service
2. **배포** → **배포 센터** 클릭
3. **연결 끊기** 버튼 클릭
4. 위의 "방법 1"을 다시 따라하기

---

## ⚙️ Azure App Service 추가 설정

배포 후 다음을 확인하세요:

### 1. 시작 명령어 설정
1. Azure Portal → App Service
2. **설정** → **구성** (Configuration)
3. **일반 설정** 탭
4. **시작 명령어** (Startup command):
   ```
   /home/site/wwwroot/startup.sh
   ```
5. **저장** 클릭

### 2. 환경 변수 설정
1. **구성** → **응용 프로그램 설정** (Application settings)
2. **+ 새 응용 프로그램 설정** 클릭
3. 다음 추가:

| 이름 | 값 |
|------|-----|
| `NEXT_PUBLIC_API_BASE_URL` | `https://recommend-your-product.azurewebsites.net` |
| `PORT` | `8000` |
| `WEBSITES_PORT` | `3000` |

4. **저장** 클릭

### 3. Node.js 및 Python 런타임 확인
1. **설정** → **구성**
2. **스택 설정** (Stack settings):
   - **Python version**: 3.11
   - **Node.js version**: 18 (필요시)

---

## 🔍 배포 문제 해결

### 배포가 실행되지 않는 경우:

#### 확인 항목:
1. **GitHub secret 확인**
   - GitHub 리포지토리 → Settings → Secrets
   - `AZURE_WEBAPP_PUBLISH_PROFILE` 존재 여부 확인

2. **GitHub Actions 워크플로우 확인**
   - `.github/workflows/azure-deploy.yml` 파일 존재 여부 확인
   - 파일이 `main` 브랜치에 있는지 확인

3. **Azure App Service 로그 확인**
   ```bash
   # Azure Portal → App Service
   # "로그" 또는 "Log Stream" 탭에서 배포 로그 확인
   ```

4. **GitHub Actions 로그 확인**
   - 리포지토리 → **Actions** 탭
   - 워크플로우 클릭 → 작업 선택 → 로그 확인

### 배포는 완료됐지만 앱이 보이지 않는 경우:

1. **시작 명령어 확인**
   - `startup.sh` 파일이 실행 권한을 가지고 있는지 확인
   - 경로: `/home/site/wwwroot/startup.sh`

2. **포트 확인**
   - 환경 변수 `PORT=8000` 설정
   - 환경 변수 `WEBSITES_PORT=3000` 설정

3. **의존성 설치 확인**
   - `requirements.txt`와 `package.json` 파일이 올바른지 확인
   - `npm install` 및 `pip install` 성공 여부 확인

4. **App Service 재시작**
   - Azure Portal → App Service → 우측 상단 **재시작** 클릭

---

## 📊 배포 후 확인

배포 완료 후 다음을 확인하세요:

### API 테스트
```bash
# 백엔드 헬스 체크
curl https://recommend-your-product.azurewebsites.net/api/health

# 모든 상품 조회
curl https://recommend-your-product.azurewebsites.net/api/products
```

### 웹사이트 확인
```
https://recommend-your-product.azurewebsites.net
```

---

## 📝 추가 팁

### 로컬에서 테스트
배포 전에 로컬에서 테스트하세요:
```bash
# 터미널 1 - 백엔드
cd backend
pip install -r requirements.txt
python main.py

# 터미널 2 - 프론트엔드
cd frontend
npm install
npm run dev
```

### Azure CLI로 배포 로그 확인
```bash
# 실시간 로그
az webapp log tail --name recommend-your-product --resource-group <resource-group-name>

# 앱 설정 확인
az webapp config show --name recommend-your-product --resource-group <resource-group-name>
```

---

## 🎯 최종 체크리스트

- [ ] GitHub 리포지토리에 코드 푸시 완료
- [ ] Azure Portal 배포 센터에서 GitHub 연동 완료
- [ ] `.github/workflows/azure-deploy.yml` 파일 존재 확인
- [ ] GitHub secret `AZURE_WEBAPP_PUBLISH_PROFILE` 설정 완료
- [ ] Azure App Service 시작 명령어 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] GitHub Actions 배포 성공 확인
- [ ] https://recommend-your-product.azurewebsites.net 접속 확인
