from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import documents, config
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="DocIntel AI API",
    description="Document Intelligence and Compliance Analysis API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3005", "http://localhost:3006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    documents.router,
    prefix="/api/v1/documents",
    tags=["documents"]
)

app.include_router(
    config.router,
    prefix="/api/v1/config",
    tags=["config"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to DocIntel AI API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "ocr": "operational",
            "nlp": "operational"
        }
    } 