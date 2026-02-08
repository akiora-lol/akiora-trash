import hashlib
import hmac
import logging
import uuid
from config.settings import settings
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from fastapi_sso import DiscordSSO
from services.user import get_user_service
from services.session import SessionService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


SECRET_KEY = settings.secret_key


def sign_session(session_id: str) -> str:

    signature = hmac.new(
        SECRET_KEY.encode(), session_id.encode(), hashlib.sha256
    ).hexdigest()
    return f"{session_id}.{signature}"


def verify_session(signed_id: str) -> str:

    try:
        session_id, signature = signed_id.rsplit(".", 1)
        expected_signature = hmac.new(
            SECRET_KEY, session_id.encode(), hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(signature, expected_signature):
            return session_id
    except (ValueError, AttributeError):
        pass
    raise HTTPException(status_code=401, detail="Invalid session signature")


class AuthService:
    def __init__(self):
        self.user_service = get_user_service()
        self.session_service = SessionService()

    async def verify_user(self, sso: DiscordSSO, request):
        async with sso:
            logger.info("init sso")
            user = await sso.verify_and_process(request)
            logger.info("finish sso")
            logger.info(user)

            if user:
                provider = user.provider
                existing_user = await self.user_service.get_user(user.email)

                if existing_user:
                    return await self.login_user(existing_user, provider)
                else:
                    return await self.register_user(user.email, provider)
        return RedirectResponse(url="/auth-error")

    async def register_user(self, email, provider):
        user = await self.user_service.create_user(email)
        ses_id = await self.session_service.create_session(
            uuid.UUID(user["_id"]),
            user["email"],
            user["roles"],
            provider,
            user["gender"],
            user["age"],
        )
        response = RedirectResponse(url="/dashboard", status_code=303)
        signed_ses = sign_session(str(ses_id))
        response.set_cookie(
            key="sid",
            value=signed_ses,
            httponly=True,
            # secure=True,
            samesite="lax",
            max_age=30 * 24 * 60 * 60,
        )
        return response

    async def login_user(self, user, provider):
        ses_id = await self.session_service.create_session(
            uuid.UUID(user["_id"]),
            user["email"],
            user["roles"],
            provider,
            user["gender"],
            user["age"],
        )

        response = RedirectResponse(url="/qup", status_code=303)
        signed_ses = sign_session(str(ses_id))
        response.set_cookie(
            key="sid",
            value=signed_ses,
            httponly=True,
            # secure=True,
            samesite="lax",
            max_age=30 * 24 * 60 * 60,
        )

        return response
