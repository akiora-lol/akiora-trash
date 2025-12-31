"""
Package initialization for routes.
"""

from .message_routes import message_router
from .chat_routes import chat_router

__all__ = ["message_router", "chat_router"]
