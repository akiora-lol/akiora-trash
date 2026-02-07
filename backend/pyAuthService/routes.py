from fastapi import APIRouter, Cookie
from typing import Annotated

router = APIRouter()


@router.get("/lol-account/start")
async def init_lol_account_verification():
    # publish to parser
    # wait 5-10sec read redis
    # set required icon id as x%28+1 and return it
    return


@router.post("/lol-account/finish")
async def complete_lol_account_verification():
    # publish to parser
    # wait 10sec read redis
    # if icon id = required icon id mark as verified
    # call user service or publish to it and send account (nametag+server as verified)
    return


# TODO bot required
@router.get("/tg-account/start")
async def tg_account_verification():
    # publish to parser
    # wait 5-10sec read redis
    # set required icon id as x%28+1 and return it
    return


# TODO bot required
@router.get("/ds-account/start")
async def ds_account_verification():
    # publish to parser
    # wait 5-10sec read redis
    # set required icon id as x%28+1 and return it
    return
