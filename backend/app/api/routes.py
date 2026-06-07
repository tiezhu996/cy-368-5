from fastapi import APIRouter
from app.services.overview_service import get_overview, batch_update_records, BatchUpdateRequest

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/api/health")
def api_health():
    return {"status": "ok"}

@router.get("/overview")
def overview():
    return get_overview()

@router.get("/api/overview")
def api_overview():
    return get_overview()

@router.patch("/api/operations/batch")
def api_batch_update(request: BatchUpdateRequest):
    return batch_update_records(request)
