from fastapi import FastAPI, Depends
from pydantic import BaseModel
from contextlib import asynccontextmanager
import logging

from container import container, MessageProducer


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with container() as request_container:
        yield {"container": request_container}
    logger.info("Application shutdown completed")


app = FastAPI(title="Order API", version="1.0.0", lifespan=lifespan)

app.include_router()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
