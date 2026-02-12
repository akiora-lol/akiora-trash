from fastapi import APIRouter, Depends, Request
from fastapi_sso.sso.yandex import YandexSSO
from config.settings import settings
from services.auth import AuthService

router = APIRouter(prefix="/yandex")


sso = YandexSSO(
    client_id=settings.yandex_cid,
    client_secret=settings.yandex_cs,
    redirect_uri="http://localhost:8000/auth/yandex/callback",
    allow_insecure_http=True,
    scope=["login:email"],
)


@router.get("/login")
async def login():

    async with sso:
        return await sso.get_login_redirect()


@router.get("/callback")
async def auth_callback(
    request: Request, auth_service: AuthService = Depends(AuthService)
):
    return await auth_service.verify_user(sso, request)
