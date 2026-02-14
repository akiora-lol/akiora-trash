from typing import Literal, Optional
from uuid import UUID
from datetime import datetime, UTC
from schemas.v1.api import ColdFormCreate, ColdFormUpdate, InteractionCreate
from models import ColdForm


class ColdFormService:
    """Сервис для работы с ColdForm документами"""

    @staticmethod
    async def create_form(form_data: ColdFormCreate) -> ColdForm:
        """Создать новую ColdForm"""
        form = ColdForm(
            owner_id=form_data.owner_id,
            rank_range=[rr.model_dump() for rr in form_data.rank_range],
            my_roles=form_data.my_roles,
            looking_for_roles=form_data.looking_for_roles,
            description=form_data.description,
            status="active",
        )
        await form.insert()
        return form

    @staticmethod
    async def get_form(form_id: UUID) -> Optional[ColdForm]:
        """Получить ColdForm по ID"""
        return await ColdForm.find_one(ColdForm.id == form_id)

    @staticmethod
    async def update_form(
        form_id: UUID, update_data: ColdFormUpdate
    ) -> Optional[ColdForm]:
        """Обновить ColdForm с сохранением истории"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        # Сохраняем текущее состояние в историю перед обновлением
        form.history.append(form.short())

        update_dict = update_data.model_dump(exclude_unset=True)
        if "rank_range" in update_dict:
            update_dict["rank_range"] = [
                rr.model_dump() for rr in update_data.rank_range
            ]

        for key, value in update_dict.items():
            setattr(form, key, value)

        form.updated_at = datetime.now(UTC)
        await form.save()
        return form

    @staticmethod
    async def delete_form(form_id: UUID) -> bool:
        """Удалить ColdForm"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return False
        await form.delete()
        return True

    @staticmethod
    async def get_forms_by_owner(owner_id: UUID) -> list[ColdForm]:
        """Получить все формы пользователя"""
        return await ColdForm.find(ColdForm.owner_id == owner_id).to_list()

    @staticmethod
    async def add_like(
        form_id: UUID, interaction: InteractionCreate
    ) -> Optional[ColdForm]:
        """Добавить лайк к форме"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        if interaction.user_id not in form.liked_by:
            form.liked_by.append(interaction.user_id)
            # Если был дизлайк - убираем
            if interaction.user_id in form.disliked_by:
                form.disliked_by.remove(interaction.user_id)
            await form.save()

        return form

    @staticmethod
    async def add_dislike(
        form_id: UUID, interaction: InteractionCreate
    ) -> Optional[ColdForm]:
        """Добавить дизлайк к форме"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        if interaction.user_id not in form.disliked_by:
            form.disliked_by.append(interaction.user_id)
            # Если был лайк - убираем
            if interaction.user_id in form.liked_by:
                form.liked_by.remove(interaction.user_id)
            await form.save()

        return form

    @staticmethod
    async def add_block(form_id: UUID, user_id: UUID) -> Optional[ColdForm]:
        """Заблокировать пользователя для формы"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        if user_id not in form.blocked_by:
            form.blocked_by.append(user_id)
            # Убираем все реакции заблокированного пользователя
            if user_id in form.liked_by:
                form.liked_by.remove(user_id)
            if user_id in form.disliked_by:
                form.disliked_by.remove(user_id)
            await form.save()

        return form

    @staticmethod
    async def remove_reaction(form_id: UUID, user_id: UUID) -> Optional[ColdForm]:
        """Убрать реакцию пользователя"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        changed = False
        if user_id in form.liked_by:
            form.liked_by.remove(user_id)
            changed = True
        if user_id in form.disliked_by:
            form.disliked_by.remove(user_id)
            changed = True

        if changed:
            await form.save()

        return form

    @staticmethod
    async def change_status(
        form_id: UUID, status: Literal["active", "frozen"]
    ) -> Optional[ColdForm]:
        """Изменить статус формы"""
        form = await ColdFormService.get_form(form_id)
        if not form:
            return None

        form.status = status
        form.updated_at = datetime.now(UTC)
        await form.save()
        return form

    @staticmethod
    async def get_active_forms(limit: int = 50) -> list[ColdForm]:
        """Получить активные формы"""
        return (
            await ColdForm.find(ColdForm.status == "active")
            .sort(-ColdForm.created_at)
            .limit(limit)
            .to_list()
        )

    @staticmethod
    async def search_by_roles(
        roles: list[Literal["top", "jg", "mid", "adc", "sup"]], limit: int = 20
    ) -> list[ColdForm]:
        """Поиск форм по ролям"""
        return (
            await ColdForm.find(
                ColdForm.status == "active", ColdForm.my_roles.all(roles)
            )
            .limit(limit)
            .to_list()
        )
