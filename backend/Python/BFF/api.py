from litestar import Litestar, get, MediaType
from litestar.openapi import OpenAPIConfig
from litestar.openapi.plugins import SwaggerRenderPlugin
from settings import setup_logging
from settings import settings
import uvicorn
from controllers import UserController
from ioc import container
from dishka.integrations.litestar import setup_dishka


def create_app() -> Litestar:

    @get("/health", media_type=MediaType.TEXT)
    def health() -> None:
        return "healthy"

    setup_logging()
    app = Litestar(
        route_handlers=[health, UserController],
        openapi_config=OpenAPIConfig(
            title=settings.app_name,
            version="1.0.0",
            render_plugins=[SwaggerRenderPlugin(path="/docs")],
        ),
    )
    setup_dishka(container, app)
    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, proxy_headers=True)
