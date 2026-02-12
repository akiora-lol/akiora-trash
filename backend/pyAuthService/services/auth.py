import hashlib
import hmac
import logging

from config.settings import settings
from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi_sso import DiscordSSO
from helpers.broker import get_rabbit_broker
from services.session import SessionService
from config.messaging import auth_exchange

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
        self.broker = get_rabbit_broker()
        self.session_service = SessionService()

    async def verify_user(self, sso: DiscordSSO, request: Request):

        client_host = request.client.host

        async with sso:
            logger.info("init sso")
            user = await sso.verify_and_process(request)

            if user:
                return await self.register_user(user.email, user.provider, client_host)
        return RedirectResponse(url="/auth-error")

    async def register_user(self, email, provider, client_host):

        ses_id = await self.session_service.create_session(email, provider, client_host)

        await self.broker.publish(
            exchange=auth_exchange,
            routing_key="auth.session.created",
            message={"email": email, "sid": str(ses_id)},
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
