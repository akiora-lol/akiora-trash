from uuid import UUID

from loguru import logger
import msgspec

from models.hot_form import HotForm, RankRange
from schemas.api.hot_form import (
    HotFormCreate,
    HotFormUpdate,
    HotFormResponse,
    HotFormListResponse,
)
from events import RPCResponse, HotFormRPCCommand


class HotFormService:
    def __init__(self, dec: msgspec.msgpack.Decoder):

        self._msgpack_encoder = msgspec.msgpack.Encoder()
        self._msgpack_decoder = dec
        logger.info("HotFormService initialized")

    async def handle_rpc(self, message: bytes) -> bytes:
        logger.debug(f"Handling RPC message: {message!r}")
        try:
            request = self._msgpack_decoder.decode(message)
            command = HotFormRPCCommand(request.command)
        except (msgspec.DecodeError, ValueError) as e:
            logger.error(f"Failed to decode RPC message: {e}")
            response = RPCResponse(success=False, error=f"Invalid request: {e}")
            return self._msgpack_encoder.encode(response)

        try:
            if command == HotFormRPCCommand.CREATE:
                result = await self._handle_create(request.params)
            elif command == HotFormRPCCommand.GET:
                result = await self._handle_get(request.params)
            elif command == HotFormRPCCommand.GET_BY_OWNER:
                result = await self._handle_get_by_owner(request.params)
            elif command == HotFormRPCCommand.GET_ALL:
                result = await self._handle_get_all(request.params)
            elif command == HotFormRPCCommand.UPDATE:
                result = await self._handle_update(request.params)
            elif command == HotFormRPCCommand.DELETE:
                result = await self._handle_delete(request.params)
            elif command == HotFormRPCCommand.LIKE:
                result = await self._handle_like(request.params)
            elif command == HotFormRPCCommand.DISLIKE:
                result = await self._handle_dislike(request.params)
            else:
                logger.error(f"Unknown command: {command}")
                response = RPCResponse(
                    success=False, error=f"Unknown command: {command}"
                )
                return self._msgpack_encoder.encode(response)

            response = RPCResponse(success=True, data=result)
        except Exception as e:
            logger.exception(f"Error handling command {command}: {e}")
            response = RPCResponse(success=False, error=str(e))

        return self._msgpack_encoder.encode(response)

    async def _handle_create(self, params: dict) -> dict:
        data = HotFormCreate(**params)
        form = await self.create(data)
        return self._form_to_dict(form)

    async def _handle_get(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        form = await self.get_by_id(form_id)
        return self._form_to_dict(form) if form else None

    async def _handle_get_by_owner(self, params: dict) -> list[dict]:
        owner_id = UUID(params["owner_id"])
        forms = await self.get_by_owner(owner_id)
        return [self._form_to_dict(f) for f in forms]

    async def _handle_get_all(self, params: dict) -> dict:
        limit = params.get("limit", 100)
        skip = params.get("skip", 0)
        result = await self.get_all(limit=limit, skip=skip)
        return {
            "items": [self._form_to_dict(f) for f in result.items],
            "total": result.total,
        }

    async def _handle_update(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        data = HotFormUpdate(**params["data"])
        form = await self.update(form_id, data)
        return self._form_to_dict(form) if form else None

    async def _handle_delete(self, params: dict) -> bool:
        form_id = UUID(params["form_id"])
        return await self.delete(form_id)

    async def _handle_like(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        user_id = UUID(params["user_id"])
        form = await self.like(form_id, user_id)
        return self._form_to_dict(form) if form else None

    async def _handle_dislike(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        user_id = UUID(params["user_id"])
        form = await self.dislike(form_id, user_id)
        return self._form_to_dict(form) if form else None

    def _form_to_dict(self, form: HotForm) -> dict:
        return {
            "id": form.id,
            "owner_id": form.owner_id,
            "owner_type": form.owner_type,
            "liked_by": form.liked_by,
            "disliked_by": form.disliked_by,
            "created_at": form.created_at,
            "rank_range": [
                {
                    "server": r.server,
                    "min_rank": r.min_rank.model_dump(),
                    "max_rank": r.max_rank.model_dump(),
                }
                for r in form.rank_range
            ],
            "my_roles": form.my_roles,
            "looking_for_roles": form.looking_for_roles,
            "description": form.description,
        }

    async def create(self, data: HotFormCreate) -> HotForm:
        logger.info(f"Creating hot form for owner {data.owner_id}")
        form = HotForm(
            owner_id=data.owner_id,
            owner_type=data.owner_type,
            rank_range=[
                RankRange(
                    server=r.server,
                    min_rank=r.min_rank,
                    max_rank=r.max_rank,
                )
                for r in data.rank_range
            ],
            my_roles=list(data.my_roles),
            looking_for_roles=list(data.looking_for_roles),
            description=data.description,
        )
        await form.insert()
        logger.info(f"Hot form created with id {form.id}")
        return form

    async def get_by_id(self, form_id: UUID) -> HotForm | None:
        logger.debug(f"Getting hot form by id: {form_id}")
        return await HotForm.get(form_id)

    async def get_by_owner(self, owner_id: UUID) -> list[HotForm]:
        logger.debug(f"Getting hot forms by owner: {owner_id}")
        return await HotForm.find(HotForm.owner_id == owner_id).to_list()

    async def get_all(self, limit: int = 100, skip: int = 0) -> HotFormListResponse:
        logger.debug(f"Getting all hot forms: limit={limit}, skip={skip}")
        total = await HotForm.count()
        items = await HotForm.find().skip(skip).limit(limit).to_list()
        return HotFormListResponse(
            items=[
                HotFormResponse(
                    id=item.id,
                    owner_id=item.owner_id,
                    owner_type=item.owner_type,
                    liked_by=item.liked_by,
                    disliked_by=item.disliked_by,
                    created_at=item.created_at,
                    rank_range=item.rank_range,
                    my_roles=item.my_roles,
                    looking_for_roles=item.looking_for_roles,
                    description=item.description,
                )
                for item in items
            ],
            total=total,
        )

    async def update(self, form_id: UUID, data: HotFormUpdate) -> HotForm | None:
        logger.info(f"Updating hot form {form_id}")
        form = await HotForm.get(form_id)
        if not form:
            logger.warning(f"Hot form {form_id} not found for update")
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(form, key, value)

        await form.save()
        logger.info(f"Hot form {form_id} updated")
        return form

    async def delete(self, form_id: UUID) -> bool:
        logger.info(f"Deleting hot form {form_id}")
        form = await HotForm.get(form_id)
        if not form:
            logger.warning(f"Hot form {form_id} not found for deletion")
            return False

        await form.delete()
        logger.info(f"Hot form {form_id} deleted")
        return True

    async def like(self, form_id: UUID, user_id: UUID) -> HotForm | None:
        logger.info(f"Liking hot form {form_id} by user {user_id}")
        form = await HotForm.get(form_id)
        if not form:
            logger.warning(f"Hot form {form_id} not found for like")
            return None

        if user_id not in form.liked_by:
            form.liked_by.append(user_id)
            if user_id in form.disliked_by:
                form.disliked_by.remove(user_id)
            await form.save()
            logger.info(f"Hot form {form_id} liked by {user_id}")

        return form

    async def dislike(self, form_id: UUID, user_id: UUID) -> HotForm | None:
        logger.info(f"Disliking hot form {form_id} by user {user_id}")
        form = await HotForm.get(form_id)
        if not form:
            logger.warning(f"Hot form {form_id} not found for dislike")
            return None

        if user_id not in form.disliked_by:
            form.disliked_by.append(user_id)
            if user_id in form.liked_by:
                form.liked_by.remove(user_id)
            await form.save()
            logger.info(f"Hot form {form_id} disliked by {user_id}")

        return form
