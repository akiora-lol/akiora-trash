from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ioc import container

from shared.src.logging import setup_logging


def setup_app(app: FastAPI): ...
