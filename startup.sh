#!/bin/bash

# 시작 스크립트 - Azure App Service용
# 백엔드와 프론트엔드를 동시에 실행합니다

echo "=== recommend-your-product 애플리케이션 시작 ==="

# 백엔드 설정
cd /home/site/wwwroot/backend
echo "백엔드 의존성 설치 중..."
pip install -r requirements.txt

# 프론트엔드 설정
cd /home/site/wwwroot/frontend
echo "프론트엔드 의존성 설치 중..."
npm install

echo "프론트엔드 빌드 중..."
npm run build

# 프로덕션 시작
echo "애플리케이션 시작 중..."
cd /home/site/wwwroot

# 프론트엔드를 포트 3000에서 실행
cd frontend
npm start &
FRONTEND_PID=$!

# 백엔드를 포트 8000에서 실행
cd ../backend
python main.py &
BACKEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"

# 모든 자식 프로세스가 종료될 때까지 대기
wait
