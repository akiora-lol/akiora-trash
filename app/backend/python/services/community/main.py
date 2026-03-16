from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from granian import Granian
from granian.constants import Interfaces
from ioc import container
from routes import user_router
from shared.logging import setup_logging


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
async def health():
    return "healthy"


app.include_router(user_router)

setup_dishka(container=container, app=app)


if __name__ == "__main__":
    Granian(
        "main:app",
        address="127.0.0.1",
        port=8000,
        interface=Interfaces.ASGI,
    ).serve()
