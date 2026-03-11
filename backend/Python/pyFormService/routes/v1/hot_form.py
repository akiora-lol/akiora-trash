from fastapi import APIRouter, HTTPException, Cookie, Depends, Query

from uuid import UUID

from services.hot_form_service import HotFormService
from schemas.v1.api import (
    HotFormCreate,
    HotFormResponse,
    HotFormUpdate,
    InteractionCreate,
)
from fastapi import status

router = APIRouter(prefix="/forms/hot")


async def get_hot_service() -> HotFormService:
    return HotFormService()


@router.post("/", response_model=HotFormResponse, status_code=status.HTTP_201_CREATED)
async def create_hot_form(
    form_data: HotFormCreate, service: HotFormService = Depends(get_hot_service)
):
    """Создать новую горячую форму"""
    form = await service.create_form(form_data)
    return form


@router.get("/{form_id}", response_model=HotFormResponse)
async def get_hot_form(
    form_id: UUID, service: HotFormService = Depends(get_hot_service)
):
    """Получить горячую форму по ID"""
    form = await service.get_form(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )
    return form


@router.put("/{form_id}", response_model=HotFormResponse)
async def update_hot_form(
    form_id: UUID,
    update_data: HotFormUpdate,
    service: HotFormService = Depends(get_hot_service),
):
    """Обновить горячую форму"""
    form = await service.update_form(form_id, update_data)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hot_form(
    form_id: UUID, service: HotFormService = Depends(get_hot_service)
):
    """Удалить горячую форму"""
    deleted = await service.delete_form(form_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )


@router.get("/owner/{owner_id}", response_model=list[HotFormResponse])
async def get_owner_forms(
    owner_id: UUID, service: HotFormService = Depends(get_hot_service)
):
    """Получить все формы владельца"""
    forms = await service.get_forms_by_owner(owner_id)
    return forms


@router.post("/{form_id}/like", response_model=HotFormResponse)
async def like_hot_form(
    form_id: UUID,
    interaction: InteractionCreate,
    service: HotFormService = Depends(get_hot_service),
):
    """Поставить лайк форме"""
    form = await service.add_like(form_id, interaction)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )
    return form


@router.post("/{form_id}/dislike", response_model=HotFormResponse)
async def dislike_hot_form(
    form_id: UUID,
    interaction: InteractionCreate,
    service: HotFormService = Depends(get_hot_service),
):
    """Поставить дизлайк форме"""
    form = await service.add_dislike(form_id, interaction)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )
    return form


@router.delete("/{form_id}/reaction/{user_id}", response_model=HotFormResponse)
async def remove_reaction_from_hot_form(
    form_id: UUID, user_id: UUID, service: HotFormService = Depends(get_hot_service)
):
    """Убрать реакцию пользователя"""
    form = await service.remove_reaction(form_id, user_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )
    return form


@router.get("/", response_model=list[HotFormResponse])
async def get_active_hot_forms(
    limit: int = 50, service: HotFormService = Depends(get_hot_service)
):
    """Получить активные горячие формы"""
    forms = await service.get_active_forms(limit)
    return forms


@router.get("/{form_id}/stats", response_model=dict)
async def get_hot_form_stats(
    form_id: UUID, service: HotFormService = Depends(get_hot_service)
):
    """Получить статистику по форме (лайки/дизлайки)"""
    form = await service.get_form(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hot form not found"
        )

    return {
        "likes_count": len(form.liked_by),
        "dislikes_count": len(form.disliked_by),
        "total_reactions": len(form.liked_by) + len(form.disliked_by),
    }
