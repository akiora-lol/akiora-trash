from uuid import UUID

from loguru import logger
from datetime import datetime, UTC
import msgspec

from models.cold_form import ColdForm, RankRange
from schemas.api.cold_form import (
    ColdFormCreate,
    ColdFormUpdate,
    ColdFormResponse,
    ColdFormListResponse,
)
from events import RPCResponse, ColdFormRPCCommand


class ColdFormService:
    def __init__(self, dec: msgspec.msgpack.Decoder):

        self._msgpack_encoder = msgspec.msgpack.Encoder()
        self._msgpack_decoder = dec
        logger.info("ColdFormService initialized")

    async def handle_rpc(self, message: bytes) -> bytes:
        logger.debug(f"Handling RPC message: {message!r}")
        try:
            request = self._msgpack_decoder.decode(message)
            command = ColdFormRPCCommand(request.command)
        except (msgspec.DecodeError, ValueError) as e:
            logger.error(f"Failed to decode RPC message: {e}")
            response = RPCResponse(success=False, error=f"Invalid request: {e}")
            return self._msgpack_encoder.encode(response)

        try:
            if command == ColdFormRPCCommand.CREATE:
                result = await self._handle_create(request.params)
            elif command == ColdFormRPCCommand.GET:
                result = await self._handle_get(request.params)
            elif command == ColdFormRPCCommand.GET_BY_OWNER:
                result = await self._handle_get_by_owner(request.params)
            elif command == ColdFormRPCCommand.GET_ALL:
                result = await self._handle_get_all(request.params)
            elif command == ColdFormRPCCommand.UPDATE:
                result = await self._handle_update(request.params)
            elif command == ColdFormRPCCommand.DELETE:
                result = await self._handle_delete(request.params)
            elif command == ColdFormRPCCommand.LIKE:
                result = await self._handle_like(request.params)
            elif command == ColdFormRPCCommand.DISLIKE:
                result = await self._handle_dislike(request.params)
            elif command == ColdFormRPCCommand.BLOCK:
                result = await self._handle_block(request.params)
            elif command == ColdFormRPCCommand.FREEZE:
                result = await self._handle_freeze(request.params)
            elif command == ColdFormRPCCommand.ACTIVATE:
                result = await self._handle_activate(request.params)
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
        data = ColdFormCreate(**params)
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
        data = ColdFormUpdate(**params["data"])
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

    async def _handle_block(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        user_id = UUID(params["user_id"])
        form = await self.block(form_id, user_id)
        return self._form_to_dict(form) if form else None

    async def _handle_freeze(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        form = await self.freeze(form_id)
        return self._form_to_dict(form) if form else None

    async def _handle_activate(self, params: dict) -> dict | None:
        form_id = UUID(params["form_id"])
        form = await self.activate(form_id)
        return self._form_to_dict(form) if form else None

    def _form_to_dict(self, form: ColdForm) -> dict:
        return {
            "id": form.id,
            "owner_id": form.owner_id,
            "owner_type": form.owner_type,
            "liked_by": form.liked_by,
            "disliked_by": form.disliked_by,
            "blocked_by": form.blocked_by,
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
            "status": form.status,
            "updated_at": form.updated_at,
            "history": [
                {
                    "blocked_by": h.blocked_by,
                    "rank_range": [
                        {
                            "server": r.server,
                            "min_rank": r.min_rank.model_dump(),
                            "max_rank": r.max_rank.model_dump(),
                        }
                        for r in h.rank_range
                    ],
                    "my_roles": h.my_roles,
                    "looking_for_roles": h.looking_for_roles,
                    "description": h.description,
                }
                for h in form.history
            ],
        }

    async def create(self, data: ColdFormCreate) -> ColdForm:
        logger.info(f"Creating cold form for owner {data.owner_id}")
        form = ColdForm(
            owner_id=data.owner_id,
            owner_type="user",
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
            status="active",
        )
        await form.insert()
        logger.info(f"Cold form created with id {form.id}")
        return form

    async def get_by_id(self, form_id: UUID) -> ColdForm | None:
        logger.debug(f"Getting cold form by id: {form_id}")
        return await ColdForm.get(form_id)

    async def get_by_owner(self, owner_id: UUID) -> list[ColdForm]:
        logger.debug(f"Getting cold forms by owner: {owner_id}")
        return await ColdForm.find(ColdForm.owner_id == owner_id).to_list()

    async def get_all(self, limit: int = 100, skip: int = 0) -> ColdFormListResponse:
        logger.debug(f"Getting all cold forms: limit={limit}, skip={skip}")
        total = await ColdForm.count()
        items = await ColdForm.find().skip(skip).limit(limit).to_list()
        return ColdFormListResponse(
            items=[
                ColdFormResponse(
                    id=item.id,
                    owner_id=item.owner_id,
                    owner_type=item.owner_type,
                    liked_by=item.liked_by,
                    disliked_by=item.disliked_by,
                    blocked_by=item.blocked_by,
                    created_at=item.created_at,
                    rank_range=item.rank_range,
                    my_roles=item.my_roles,
                    looking_for_roles=item.looking_for_roles,
                    description=item.description,
                    status=item.status,
                    updated_at=item.updated_at,
                    history=item.history,
                )
                for item in items
            ],
            total=total,
        )

    async def update(self, form_id: UUID, data: ColdFormUpdate) -> ColdForm | None:
        logger.info(f"Updating cold form {form_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for update")
            return None

        update_data = data.model_dump(exclude_unset=True)

        if any(
            key in update_data
            for key in ["rank_range", "my_roles", "looking_for_roles", "description"]
        ):
            short_form = form.short()
            form.history.append(short_form)
            logger.info(f"Added snapshot to history for cold form {form_id}")

        for key, value in update_data.items():
            if value is not None:
                setattr(form, key, value)

        form.updated_at = datetime.now(tz=UTC)
        await form.save()
        logger.info(f"Cold form {form_id} updated")
        return form

    async def delete(self, form_id: UUID) -> bool:
        logger.info(f"Deleting cold form {form_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for deletion")
            return False

        await form.delete()
        logger.info(f"Cold form {form_id} deleted")
        return True

    async def like(self, form_id: UUID, user_id: UUID) -> ColdForm | None:
        logger.info(f"Liking cold form {form_id} by user {user_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for like")
            return None

        if user_id not in form.liked_by:
            form.liked_by.append(user_id)
            if user_id in form.disliked_by:
                form.disliked_by.remove(user_id)
            await form.save()
            logger.info(f"Cold form {form_id} liked by {user_id}")

        return form

    async def dislike(self, form_id: UUID, user_id: UUID) -> ColdForm | None:
        logger.info(f"Disliking cold form {form_id} by user {user_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for dislike")
            return None

        if user_id not in form.disliked_by:
            form.disliked_by.append(user_id)
            if user_id in form.liked_by:
                form.liked_by.remove(user_id)
            await form.save()
            logger.info(f"Cold form {form_id} disliked by {user_id}")

        return form

    async def block(self, form_id: UUID, user_id: UUID) -> ColdForm | None:
        logger.info(f"Blocking cold form {form_id} by user {user_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for block")
            return None

        if user_id not in form.blocked_by:
            form.blocked_by.append(user_id)
            await form.save()
            logger.info(f"Cold form {form_id} blocked by {user_id}")

        return form

    async def freeze(self, form_id: UUID) -> ColdForm | None:
        logger.info(f"Freezing cold form {form_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for freeze")
            return None

        form.status = "frozen"
        form.updated_at = datetime.now(tz=UTC)
        await form.save()
        logger.info(f"Cold form {form_id} frozen")
        return form

    async def activate(self, form_id: UUID) -> ColdForm | None:
        logger.info(f"Activating cold form {form_id}")
        form = await ColdForm.get(form_id)
        if not form:
            logger.warning(f"Cold form {form_id} not found for activate")
            return None

        form.status = "active"
        form.updated_at = datetime.now(tz=UTC)
        await form.save()
        logger.info(f"Cold form {form_id} activated")
        return form
