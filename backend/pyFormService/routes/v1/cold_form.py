from fastapi import APIRouter, HTTPException, Depends, Query, status


from uuid import UUID
from typing import List, Literal

from schemas.v1.api import (
    ColdFormCreate,
    ColdFormUpdate,
    ColdFormResponse,
    InteractionCreate,
)
from services.cold_form_service import ColdFormService


router = APIRouter(prefix="/forms/cold")


async def get_cold_service() -> ColdFormService:
    return ColdFormService()


@router.post("/", response_model=ColdFormResponse, status_code=status.HTTP_201_CREATED)
async def create_cold_form(
    form_data: ColdFormCreate, service: ColdFormService = Depends(get_cold_service)
):
    """Создать новую холодную форму"""
    form = await service.create_form(form_data)
    return form


@router.get("/{form_id}", response_model=ColdFormResponse)
async def get_cold_form(
    form_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Получить холодную форму по ID"""
    form = await service.get_form(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.put("/{form_id}", response_model=ColdFormResponse)
async def update_cold_form(
    form_id: UUID,
    update_data: ColdFormUpdate,
    service: ColdFormService = Depends(get_cold_service),
):
    """Обновить холодную форму (с сохранением истории)"""
    form = await service.update_form(form_id, update_data)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cold_form(
    form_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Удалить холодную форму"""
    deleted = await service.delete_form(form_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )


@router.get("/owner/{owner_id}", response_model=List[ColdFormResponse])
async def get_owner_cold_forms(
    owner_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Получить все холодные формы владельца"""
    forms = await service.get_forms_by_owner(owner_id)
    return forms


@router.post("/{form_id}/like", response_model=ColdFormResponse)
async def like_cold_form(
    form_id: UUID,
    interaction: InteractionCreate,
    service: ColdFormService = Depends(get_cold_service),
):
    """Поставить лайк холодной форме"""
    form = await service.add_like(form_id, interaction)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.post("/{form_id}/dislike", response_model=ColdFormResponse)
async def dislike_cold_form(
    form_id: UUID,
    interaction: InteractionCreate,
    service: ColdFormService = Depends(get_cold_service),
):
    """Поставить дизлайк холодной форме"""
    form = await service.add_dislike(form_id, interaction)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.post("/{form_id}/block/{user_id}", response_model=ColdFormResponse)
async def block_user_in_cold_form(
    form_id: UUID, user_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Заблокировать пользователя в холодной форме"""
    form = await service.add_block(form_id, user_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.delete("/{form_id}/reaction/{user_id}", response_model=ColdFormResponse)
async def remove_reaction_from_cold_form(
    form_id: UUID, user_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Убрать реакцию пользователя"""
    form = await service.remove_reaction(form_id, user_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.patch("/{form_id}/status", response_model=ColdFormResponse)
async def change_cold_form_status(
    form_id: UUID,
    status: Literal["active", "frozen"],
    service: ColdFormService = Depends(get_cold_service),
):
    """Изменить статус холодной формы"""
    form = await service.change_status(form_id, status)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )
    return form


@router.get("/", response_model=List[ColdFormResponse])
async def get_active_cold_forms(
    limit: int = 50, service: ColdFormService = Depends(get_cold_service)
):
    """Получить активные холодные формы"""
    forms = await service.get_active_forms(limit)
    return forms


@router.get("/search/by-roles", response_model=List[ColdFormResponse])
async def search_cold_forms_by_roles(
    roles: List[Literal["top", "jg", "mid", "adc", "sup"]] = Query(...),
    limit: int = 20,
    service: ColdFormService = Depends(get_cold_service),
):
    """Поиск холодных форм по ролям"""
    forms = await service.search_by_roles(roles, limit)
    return forms


@router.get("/{form_id}/history", response_model=List[dict])
async def get_cold_form_history(
    form_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Получить историю изменений холодной формы"""
    form = await service.get_form(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )

    return [
        {
            "changed_at": idx,  # Здесь можно добавить timestamp в ShortForm
            "data": short.model_dump(),
        }
        for idx, short in enumerate(form.history)
    ]


@router.get("/{form_id}/stats", response_model=dict)
async def get_cold_form_stats(
    form_id: UUID, service: ColdFormService = Depends(get_cold_service)
):
    """Получить подробную статистику по холодной форме"""
    form = await service.get_form(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cold form not found"
        )

    return {
        "likes_count": len(form.liked_by),
        "dislikes_count": len(form.disliked_by),
        "blocks_count": len(form.blocked_by),
        "total_reactions": len(form.liked_by) + len(form.disliked_by),
        "unique_interactions": len(
            set(form.liked_by + form.disliked_by + form.blocked_by)
        ),
        "status": form.status,
        "created_at": form.created_at.isoformat(),
        "updated_at": form.updated_at.isoformat(),
        "history_versions": len(form.history),
    }
