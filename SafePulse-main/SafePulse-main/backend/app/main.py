"""
SafePulse FastAPI Backend Server
Data-Driven Emergency Response System
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes_triage import router as triage_router
from app.api.routes_guidance import router as guidance_router
from app.api.routes_analytics import router as analytics_router

app = FastAPI(
    title="SafePulse API",
    description="Data-Driven Emergency Response & Urgency Triage System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(triage_router, prefix="/api/v1")
app.include_router(guidance_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")

@app.get("/api/v1/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "SafePulse Emergency Response System",
        "version": "1.0.0",
        "triage_engine": "Active (Priority-First + ML Urgency Engine)",
        "protocol": "Phantom Protocol Supported (OAP)"
    }

# Frontend Static Assets Mounting
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
frontend_dir = os.path.join(base_dir, "frontend")

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_frontend_root():
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "SafePulse API is running. Frontend index.html not yet built."}

    @app.get("/{full_path:path}")
    def serve_frontend_files(full_path: str):
        # Do not swallow unmatched API or OpenAPI routes
        normalized_path = full_path.strip("/").lower()
        if (
            normalized_path.startswith("api/")
            or normalized_path in ("api", "docs", "redoc", "openapi.json")
        ):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")

        file_path = os.path.join(frontend_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for SPA routes
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Not Found"}

