from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import init_database
from app.routers import auth, upload, ai, health

def create_app() -> FastAPI:
    app = FastAPI(
        title="Virtual Try-On API",
        description="Backend API for Virtual Try-On Mobile Application",
        version="1.0.0",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify exact origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Static files for uploaded images
    if os.path.exists("uploads"):
        app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    # Include routers
    app.include_router(health.router)
    app.include_router(auth.router, prefix="/auth", tags=["authentication"])
    app.include_router(upload.router, prefix="/upload", tags=["upload"])
    app.include_router(ai.router, prefix="/ai", tags=["ai"])

    return app

app = create_app()

@app.on_event("startup")
async def startup_event():
    await init_database()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)