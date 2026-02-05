from fastapi import APIRouter

router = APIRouter(prefix="/hot-form")


@router.post("/")
async def create_form():
    return


@router.get("/")
async def get_all_forms():
    return


@router.get("/{id}")
async def get_form():
    return


@router.patch("/{id}")
async def update_form():
    return


@router.patch("/account-info/{id}")
async def update_form_account_info():
    return


@router.patch("/user-info/{id}")
async def update_form_user_info():
    return


@router.patch("/like/{id}")
async def like_form():
    return


@router.patch("/dislike/{id}")
async def dislike_form():
    return


@router.patch("/hide/{id}")
async def hide_form_creator():
    return
