from typing import Literal, Annotated
from fastapi import APIRouter, Request, Cookie

from dishka.integrations.fastapi import FromDishka, DishkaRoute
from services import AuthService
from schemas.api import Cookie as CookieSchema, LoginFInishRequest, LoginInitRequest

router = APIRouter(route_class=DishkaRoute)

ProviderType = Literal[
    "yandex",
    "discord",
]


@router.get("/{provider}/login")
async def login_oauth(provider: ProviderType, auth_service: FromDishka[AuthService]):

    async with auth_service.get_sso(provider) as sso:
        return await sso.get_login_redirect()


@router.get("/{provider}/callback")
async def auth_callback(
    provider: ProviderType, request: Request, auth_service: FromDishka[AuthService]
):
    return await auth_service.verify_user_oauth(provider, request)


@router.post("/email/login/start")
async def login_email(
    req_body: LoginInitRequest, auth_service: FromDishka[AuthService]
):
    return await auth_service.init_verify_user_email(req_body.email)


@router.post("/email/login/finish")
async def enter_email_code(
    req_body: LoginFInishRequest,
    cookie: Annotated[CookieSchema, Cookie()],
    auth_service: FromDishka[AuthService],
):
    print(cookie)
    return await auth_service.finish_verify_user_email(
        cookie.email, cookie.cvid, req_body.code
    )
