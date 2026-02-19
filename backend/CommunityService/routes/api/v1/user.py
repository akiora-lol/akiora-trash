from fastapi import APIRouter, HTTPException, Cookie, Depends

from schemas.v1.user import CreateUser, EmailRequest, SimpleUpdateRequest
from models.user import User
from repos.user import UserRepo
from services.session import SessionDescriptor
from typing import Annotated
from pydantic import BaseModel
from uuid import UUID

router = APIRouter(prefix="/users")


class Cookies(BaseModel):
    session_id: str


@router.post("/")
async def create_user(create_data: CreateUser) -> User:
    user = await UserRepo.create_user(email=create_data.email)
    if user:
        return user
    raise HTTPException(status_code=409, detail="Email taken")


@router.patch("/")
async def update_user(
    update_data: SimpleUpdateRequest,
    cookies: Annotated[Cookies, Cookie()],
    sd: SessionDescriptor = Depends(SessionDescriptor),
) -> User:
    user_id = await sd.get_user_id_by_session_id(cookies.session_id)
    print(user_id)
    if user_id:
        user = await UserRepo.update_user(user_id, update_data)
        return user
    raise HTTPException(status_code=404)


@router.get("/{id}")
async def get_user(id: UUID) -> User | None:
    user = await UserRepo.get_user_by_id(id)
    if user:
        return user
    raise HTTPException(status_code=404)


@router.post("/email")
async def get_user_by_email(emailR: EmailRequest) -> User | None:

    user = await User.find_one(User.email == emailR.email)
    if user:
        return user

    raise HTTPException(status_code=404)
