from typing import Optional
from uuid import UUID

from schemas.v1.api import HotFormCreate, HotFormUpdate, InteractionCreate
from models import HotForm


class HotFormService:
    """Сервис для работы с HotForm документами"""

    @staticmethod
    async def create_form(form_data: HotFormCreate) -> HotForm:
        """Создать новую HotForm"""
        form = HotForm(
            owner_id=form_data.owner_id,
            owner_type=form_data.owner_type,
            rank_range=[rr.model_dump() for rr in form_data.rank_range],
            my_roles=form_data.my_roles,
            looking_for_roles=form_data.looking_for_roles,
            description=form_data.description,
        )
        await form.insert()
        return form

    @staticmethod
    async def get_form(form_id: UUID) -> Optional[HotForm]:
        """Получить HotForm по ID"""
        return await HotForm.find_one(HotForm.id == form_id)

    @staticmethod
    async def update_form(
        form_id: UUID, update_data: HotFormUpdate
    ) -> Optional[HotForm]:
        """Обновить HotForm"""
        form = await HotFormService.get_form(form_id)
        if not form:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        if "rank_range" in update_dict:
            update_dict["rank_range"] = [
                rr.model_dump() for rr in update_data.rank_range
            ]

        for key, value in update_dict.items():
            setattr(form, key, value)

        await form.save()
        return form

    @staticmethod
    async def delete_form(form_id: UUID) -> bool:
        """Удалить HotForm"""
        form = await HotFormService.get_form(form_id)
        if not form:
            return False
        await form.delete()
        return True

    @staticmethod
    async def get_forms_by_owner(owner_id: UUID) -> list[HotForm]:
        """Получить все формы владельца"""
        return await HotForm.find(HotForm.owner_id == owner_id).to_list()

    @staticmethod
    async def add_like(
        form_id: UUID, interaction: InteractionCreate
    ) -> Optional[HotForm]:
        """Добавить лайк к форме"""
        form = await HotFormService.get_form(form_id)
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
    ) -> Optional[HotForm]:
        """Добавить дизлайк к форме"""
        form = await HotFormService.get_form(form_id)
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
    async def remove_reaction(form_id: UUID, user_id: UUID) -> Optional[HotForm]:
        """Убрать реакцию пользователя"""
        form = await HotFormService.get_form(form_id)
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
    async def get_active_forms(limit: int = 50) -> list[HotForm]:
        """Получить активные формы (сортировка по created_at)"""
        return await HotForm.find_all().sort(-HotForm.created_at).limit(limit).to_list()
