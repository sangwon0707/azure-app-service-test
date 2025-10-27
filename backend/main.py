from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI()

# CORS 설정 - 프론트엔드에서 접근 가능하도록
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://recommend-your-product.azurewebsites.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 샘플 데이터 - 실제로는 데이터베이스에서 가져올 수 있음
SAMPLE_PRODUCTS = [
    {"id": 1, "name": "MacBook Pro", "category": "laptop", "price": 1999, "description": "고성능 노트북"},
    {"id": 2, "name": "iPhone 15", "category": "phone", "price": 999, "description": "최신 스마트폰"},
    {"id": 3, "name": "iPad Air", "category": "tablet", "price": 599, "description": "강력한 태블릿"},
    {"id": 4, "name": "AirPods Pro", "category": "audio", "price": 249, "description": "무선 이어폰"},
    {"id": 5, "name": "Apple Watch", "category": "wearable", "price": 399, "description": "스마트 워치"},
]

class ProductRequest(BaseModel):
    category: str = None
    max_price: float = None

class ProductRecommendation(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: str

@app.get("/")
async def root():
    return {"message": "recommend-your-product API에 오신 것을 환영합니다!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/products")
async def get_all_products():
    return {"products": SAMPLE_PRODUCTS}

@app.post("/api/recommend")
async def get_recommendations(request: ProductRequest):
    """카테고리와 가격대에 따라 상품을 추천합니다."""
    recommendations = SAMPLE_PRODUCTS

    if request.category:
        recommendations = [p for p in recommendations if p["category"] == request.category]

    if request.max_price:
        recommendations = [p for p in recommendations if p["price"] <= request.max_price]

    return {"recommendations": recommendations}

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    """특정 상품의 상세 정보를 조회합니다."""
    product = next((p for p in SAMPLE_PRODUCTS if p["id"] == product_id), None)
    if not product:
        return {"error": "Product not found"}, 404
    return product

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
