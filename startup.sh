#!/bin/bash

# 시작 스크립트 - Azure App Service용
# Azure는 포트 8080을 기본으로 사용하므로 이에 맞게 설정

echo "=== recommend-your-product 애플리케이션 시작 ==="

# 작업 디렉토리
cd /home/site/wwwroot

# 1. 프론트엔드 설정 및 빌드
echo "[1/3] 프론트엔드 설정 중..."
cd frontend
echo "  - npm 의존성 설치..."
npm install --production

echo "  - Next.js 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 프론트엔드 빌드 실패!"
  exit 1
fi

# 2. 백엔드 설정
echo "[2/3] 백엔드 설정 중..."
cd ../backend
echo "  - Python 의존성 설치..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
  echo "❌ 백엔드 의존성 설치 실패!"
  exit 1
fi

# 3. 애플리케이션 시작
echo "[3/3] 애플리케이션 시작 중..."
cd /home/site/wwwroot

# 프론트엔드 시작 (포트 8080 - Azure 기본 포트)
echo "  - 프론트엔드 시작 (포트 8080)..."
cd frontend
PORT=8080 npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "    Frontend PID: $FRONTEND_PID"

# 백엔드 시작 (포트 8000)
echo "  - 백엔드 시작 (포트 8000)..."
cd ../backend
PORT=8000 python main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "    Backend PID: $BACKEND_PID"

echo ""
echo "✅ 애플리케이션이 시작되었습니다!"
echo "   - Frontend: http://0.0.0.0:8080"
echo "   - Backend: http://0.0.0.0:8000"
echo ""

# 모든 자식 프로세스가 종료될 때까지 대기
wait
