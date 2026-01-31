from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path

# Load env from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

import logging
import uvicorn

from astro_app.backend.database import engine, Base
from astro_app.backend.auth.router import router as auth_router
from astro_app.backend.geo.router import router as geo_router
from astro_app.backend.charts.router import router as user_charts_router
from astro_app.backend.routers.calculations import router as calculations_router
from astro_app.backend.routers.matching import router as matching_router
from astro_app.backend.routers.panchang import router as panchang_router
from astro_app.backend.routers.tools import router as tools_router
from astro_app.backend.routers.ai_insight import router as ai_insight_router
from astro_app.backend.routers.business import router as business_router
from astro_app.backend.routers.vastu import router as vastu_router
from astro_app.backend.routers.elite_vastu import router as elite_vastu_router
from astro_app.backend.routers.compatibility import router as compatibility_router
from astro_app.backend.routers.kp_router import router as kp_router

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(title="Astrology360 API", version="1.0.0")

# Global Exception Handlers
@app.exception_handler(PermissionError)
async def permission_error_handler(request: Request, exc: PermissionError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": str(exc)},
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5176",
        "http://127.0.0.1:5176", # Vite Port
        "http://localhost:3000",
        "http://localhost:8000", # Self
        "http://127.0.0.1:8000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(geo_router, prefix="/api/geo", tags=["geo"])
app.include_router(user_charts_router, prefix="/api/charts", tags=["user_charts"])

# Calculation Routers (Logic)
app.include_router(calculations_router, prefix="/api/chart", tags=["calculations"])
app.include_router(panchang_router, prefix="/api/chart", tags=["panchang"])
app.include_router(matching_router, prefix="/api/match", tags=["matching"])
app.include_router(tools_router, prefix="/api/tools", tags=["tools"])
app.include_router(ai_insight_router, prefix="/api/ai", tags=["ai"])

app.include_router(business_router, prefix="/api/business", tags=["business"])
app.include_router(vastu_router, prefix="/api/vastu", tags=["vastu"])
app.include_router(elite_vastu_router, prefix="/api/vastu/elite", tags=["elite_vastu"])
app.include_router(compatibility_router, prefix="/api/compatibility", tags=["compatibility"])
app.include_router(kp_router, prefix="/api", tags=["kp_astrology"])

# Debug: Print Routes
for route in app.routes:
    if hasattr(route, "path"):
        logger.info(f"Route: {route.path} [{','.join(route.methods)}]")

from astro_app.backend.routers.chat_history import router as chat_history_router
app.include_router(chat_history_router, prefix="/api", tags=["chat_history"])

# Compatibility alias to match original main.py if needed, 
# main.py had @app.post("/chart/compatibility") AND @app.post("/match/ashtakoot")
# Let's add the alias route manually here or in the router if strictly needed.
# The matching router has /ashtakoot and /compatibility.
# If we mount matching_router under /match, we have /match/ashtakoot and /match/compatibility.
# Original had /chart/compatibility.
# To support legacy /chart/compatibility, we can mount matching router under /chart as well? 
# No, duplicate routes. 
# Better: Just add the specific compatibility route to calculations.py or keep it in matching but include matching router twice with different prefixes?
# Simpler: The frontend likely checks /match/ashtakoot for MatchMaking page. 
# /chart/compatibility was for ChartCompatibility page.
# I will mount matching_router under /chart too, but only for compatibility?
# Actually, let's just mount matching_router under /match and /chart separately if feasible, or just leave it clean and simple.
# The original main.py had:
# @app.post("/chart/compatibility")
# @app.post("/match/ashtakoot")
# async def get_compatibility...
# 
# So it listened on BOTH.
# I will add the /chart/compatibility support in matching_router if I want to be 100% backward compatible without changes.
# But matching_router has `@router.post("/compatibility")` and `@router.post("/ashtakoot")`.
# If I mount matching_router to `/match`, I get `/match/compatibility` and `/match/ashtakoot`.
# Frontend might be calling `/chart/compatibility`.
# To be safe, I will include matching_router under `/chart` as well? No, that exposes `/chart/ashtakoot` which might be fine.
# Let's include matching_router under `/chart` as well for backward compatibility?
# Actually, I'll essentially duplicate the mount for now to strictly mimic previous behavior if frontend expects it.
app.include_router(matching_router, prefix="/chart", tags=["matching_alias"])


@app.get("/")
def root():
    return {"message": "Welcome to Astrology360 API. Please login to use features."}

@app.get("/debug/routes")
def get_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, "path"):
            routes.append({
                "path": route.path, 
                "name": route.name, 
                "methods": list(route.methods) if hasattr(route, "methods") else []
            })
    return routes

if __name__ == "__main__":
    uvicorn.run("astro_app.backend.main:app", host="0.0.0.0", port=8000, reload=True)
# Force reload Thu Jan 29 23:13:53 IST 2026
