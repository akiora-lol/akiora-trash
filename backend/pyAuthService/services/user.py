from typing import Optional, Dict, Any
import httpx
from config.settings import settings
import asyncio
from functools import lru_cache


class UserService:
    """Сервис для работы с пользователями"""

    def __init__(self, http_client: Optional[httpx.AsyncClient] = None):

        self.user_url = settings.user_service_url + "/api/user-service/v1"

        self.timeout = 30.0
        self._client = http_client
        self._client_lock = asyncio.Lock()

    async def _ensure_client(self) -> httpx.AsyncClient:
        """Обеспечение наличия HTTP клиента"""
        if self._client is None:
            async with self._client_lock:
                if self._client is None:
                    self._client = httpx.AsyncClient(
                        timeout=self.timeout,
                        headers={
                            "User-Agent": "Internal-Service/1.0",
                            "Content-Type": "application/json",
                        },
                        limits=httpx.Limits(
                            max_keepalive_connections=5,
                            max_connections=10,
                            keepalive_expiry=30.0,
                        ),
                    )
        return self._client

    async def get_user(self, email: str) -> Dict[str, Any]:

        data = {"email": email}

        try:
            client = await self._ensure_client()
            response = await client.post(f"{self.user_url}/users/email", json=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise Exception(f"HTTP error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error: {str(e)}")

    async def create_user(self, email) -> Dict[str, Any]:
        """Создание пользователя"""
        try:
            client = await self._ensure_client()
            user_data = {"email": email, "key": "123"}
            response = await client.post(f"{self.user_url}/users/", json=user_data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error: {e.response.status_code}")

    async def close(self):
        """Закрытие клиента"""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self):
        """Контекстный менеджер"""
        await self._ensure_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Закрытие при выходе из контекста"""
        await self.close()


_shared_http_client: Optional[httpx.AsyncClient] = None
_shared_http_client_lock = asyncio.Lock()


async def get_shared_http_client() -> httpx.AsyncClient:
    """Singleton HTTP клиент для всего приложения"""
    global _shared_http_client, _shared_http_client_lock

    async with _shared_http_client_lock:
        if _shared_http_client is None:
            _shared_http_client = httpx.AsyncClient(
                timeout=30.0,
                limits=httpx.Limits(
                    max_keepalive_connections=20,
                    max_connections=100,
                    keepalive_expiry=30.0,
                ),
                headers={
                    "User-Agent": "Internal-Service/1.0",
                },
            )

    return _shared_http_client


async def close_shared_http_client():
    """Закрытие singleton HTTP клиента"""
    global _shared_http_client

    if _shared_http_client:
        await _shared_http_client.aclose()
        _shared_http_client = None


@lru_cache(maxsize=1)
def get_user_service() -> UserService:
    global _shared_http_client
    return UserService(http_client=_shared_http_client)


async def user_service_dependency() -> UserService:

    service = get_user_service()
    return service
