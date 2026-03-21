from typing import *

import httpx

from ..api_config import APIConfig, HTTPException
from ..models import *


def HealthHealth(api_config_override: Optional[APIConfig] = None) -> None:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/health"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request(
            "get",
            httpx.URL(path),
            headers=headers,
            params=query_params,
        )

    if response.status_code != 200:
        raise HTTPException(response.status_code, f"HealthHealth failed with status code: {response.status_code}")
    else:
        body = None if 200 == 204 else response.json()

    return None


def UsersGetUsers(
    api_config_override: Optional[APIConfig] = None,
    *,
    user_uc: Any,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
) -> List[UserResponse]:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/users"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {"user_uc": user_uc, "limit": limit, "offset": offset}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request(
            "get",
            httpx.URL(path),
            headers=headers,
            params=query_params,
        )

    if response.status_code != 200:
        raise HTTPException(response.status_code, f"UsersGetUsers failed with status code: {response.status_code}")
    else:
        body = None if 200 == 204 else response.json()

    return [UserResponse(**item) for item in body]


def UsersCreateUser(api_config_override: Optional[APIConfig] = None, *, user_uc: Any, data: UserCreate) -> UserResponse:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/users"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {"user_uc": user_uc}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request("post", httpx.URL(path), headers=headers, params=query_params, json=data.dict())

    if response.status_code != 201:
        raise HTTPException(response.status_code, f"UsersCreateUser failed with status code: {response.status_code}")
    else:
        body = None if 201 == 204 else response.json()

    return UserResponse(**body) if body is not None else UserResponse()


def UsersUserIdGetUser(api_config_override: Optional[APIConfig] = None, *, user_uc: Any, user_id: str) -> UserResponse:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/users/{user_id}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {"user_uc": user_uc}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request(
            "get",
            httpx.URL(path),
            headers=headers,
            params=query_params,
        )

    if response.status_code != 200:
        raise HTTPException(response.status_code, f"UsersUserIdGetUser failed with status code: {response.status_code}")
    else:
        body = None if 200 == 204 else response.json()

    return UserResponse(**body) if body is not None else UserResponse()


def UsersUserIdDeleteUser(api_config_override: Optional[APIConfig] = None, *, user_uc: Any, user_id: str) -> None:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/users/{user_id}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {"user_uc": user_uc}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request(
            "delete",
            httpx.URL(path),
            headers=headers,
            params=query_params,
        )

    if response.status_code != 204:
        raise HTTPException(
            response.status_code, f"UsersUserIdDeleteUser failed with status code: {response.status_code}"
        )
    else:
        body = None if 204 == 204 else response.json()

    return None


def UsersUserIdUpdateUser(
    api_config_override: Optional[APIConfig] = None, *, user_uc: Any, user_id: str, data: UserUpdate
) -> UserResponse:
    api_config = api_config_override if api_config_override else APIConfig()

    base_path = api_config.base_path
    path = f"/users/{user_id}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer { api_config.get_access_token() }",
    }
    query_params: Dict[str, Any] = {"user_uc": user_uc}

    query_params = {key: value for (key, value) in query_params.items() if value is not None}

    with httpx.Client(base_url=base_path, verify=api_config.verify) as client:
        response = client.request("patch", httpx.URL(path), headers=headers, params=query_params, json=data.dict())

    if response.status_code != 200:
        raise HTTPException(
            response.status_code, f"UsersUserIdUpdateUser failed with status code: {response.status_code}"
        )
    else:
        body = None if 200 == 204 else response.json()

    return UserResponse(**body) if body is not None else UserResponse()
