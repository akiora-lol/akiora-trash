from dishka.integrations.litestar import setup_dishka
from litestar import Litestar, MediaType, get
from litestar.openapi import OpenAPIConfig
from litestar.openapi.plugins import SwaggerRenderPlugin

from shared import setup_logging

from .controllers import UserController
from .ioc import container


def create_app() -> Litestar:

    @get("/health", media_type=MediaType.TEXT)
    def health() -> str:
        return "healthy"

    setup_logging()
    app = Litestar(
        route_handlers=[health, UserController],
        openapi_config=OpenAPIConfig(
            title="community_app",
            version="1.0.0",
            render_plugins=[SwaggerRenderPlugin(path="/docs")],
            openapi_json_path="/schema/openapi.json",
        ),
    )
    setup_dishka(container, app)
    return app


app = create_app()
