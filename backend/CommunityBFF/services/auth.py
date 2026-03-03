from settings import Settings
from services import AuthLogger, logged_async

from aiohttp import ClientSession


class AuthService:
    def __init__(
        self,
        settings: Settings,
        logger: AuthLogger,
        session: ClientSession,
    ):
        self.settings = settings
        self.logger = logger
        self.session = session

    @logged_async
    async def get_user(self, user_id):
        try:
            async with self.session.get(f"/users/{user_id}") as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    self.logger.warning(f"User {user_id} not found")
                    return None
                else:
                    self.logger.error(f"Auth service error: {response.status}")
                    response.raise_for_status()
        except Exception as e:
            self.logger.error(f"Failed to get user {user_id}: {e}")
            raise
