from fastapi import APIRouter
from .hot_form import router as hot_form_router
from .cold_form import router as cold_form_router

router = APIRouter(prefix="/v1")
router.include_router(hot_form_router)
router.include_router(cold_form_router)
