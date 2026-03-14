from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ioc import container

from shared.src.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):

    yield
    await container.close()


app = FastAPI(lifespan=lifespan)


setup_logging()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return "healthy"


setup_dishka(container=container, app=app)
