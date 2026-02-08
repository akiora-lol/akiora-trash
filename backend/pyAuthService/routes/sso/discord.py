from fastapi import APIRouter, Depends, Request
from fastapi_sso.sso.discord import DiscordSSO
from config.settings import settings
from services.auth import AuthService

router = APIRouter(prefix="/discord")


sso = DiscordSSO(
    client_id=settings.discord_cid,
    client_secret=settings.discord_cs,
    redirect_uri="http://localhost:8000/auth/discord/callback",
    allow_insecure_http=True,
    scope=["email"],
)


@router.get("/login")
async def login():
    """Initialize auth and redirect"""
    async with sso:
        return await sso.get_login_redirect()


@router.get("/callback")
async def auth_callback(
    request: Request, auth_service: AuthService = Depends(AuthService)
):
    return await auth_service.verify_user(sso, request)
