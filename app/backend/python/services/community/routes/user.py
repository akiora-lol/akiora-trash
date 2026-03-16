from dishka.integrations.fastapi import DishkaDep
from fastapi import APIRouter, HTTPException, status

from models.user import UserCreate, UserResponse, UserUpdate
from services.user_command import UserCommandService
from services.user_query import UserQueryService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def get_users(
    limit: int = 100,
    offset: int = 0,
    query_service: DishkaDep[UserQueryService] = None,  # pyright: ignore
) -> list[UserResponse]:
    users = await query_service.get_all_users(limit, offset)
    return users  # pyright: ignore


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    query_service: DishkaDep[UserQueryService] = None,  # pyright: ignore
) -> UserResponse:
    user = await query_service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user  # pyright: ignore


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    command_service: DishkaDep[UserCommandService] = None,  # pyright: ignore
    query_service: DishkaDep[UserQueryService] = None,  # pyright: ignore
) -> UserResponse:
    user_id = await command_service.create_user(user_data)
    user = await query_service.get_user(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    return user  # pyright: ignore


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    command_service: DishkaDep[UserCommandService] = None,  # pyright: ignore
    query_service: DishkaDep[UserQueryService] = None,  # pyright: ignore
) -> UserResponse:
    exists = await query_service.user_exists(user_id)
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await command_service.update_user(user_id, user_data)
    user = await query_service.get_user(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user",
        )
    return user  # pyright: ignore


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    command_service: DishkaDep[UserCommandService] = None,  # pyright: ignore
) -> None:
    success = await command_service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
