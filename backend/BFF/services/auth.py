from settings import Settings
from loguru import logger

from aiohttp import ClientSession


class AuthService:
    def __init__(
        self,
        settings: Settings,
        session: ClientSession,
    ):
        self.settings = settings

        self.session = session

    async def get_user(self, user_id):
        try:
            async with self.session.get(f"/users/{user_id}") as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    logger.warning(f"User {user_id} not found")
                    return None
                else:
                    logger.error(f"Auth service error: {response.status}")
                    response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {e}")
            raise
