from logging import Logger, DEBUG, getLogger
from pydantic import BaseModel
import time
from functools import wraps


class ApiLogger(Logger):
    def __init__(self):
        super.__init__(self, "API", DEBUG)


class AuthLogger(Logger):
    def __init__(self):
        super.__init__(self, "Auth", DEBUG)


class SessionLogger(Logger):
    def __init__(self):
        super.__init__(self, "Session", DEBUG)


class DomainLogger:
    def get_domain_logger(self, name):
        return getLogger(name)


def logged(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        logger = getattr(self, "logger", None)
        if logger:
            start = time.time()
            logger.debug(f"Classname = {self.__class__.__name__}")
            logger.debug(f"Function = {func.__name__}")
            logger.debug(f"Args = {args}")
            logger.debug(f"Kwargs = {kwargs}")

            try:
                result = func(self, *args, **kwargs)
                duration = (time.time() - start) * 1000
                logger.debug(f"← {func.__name__} completed in {duration:.2f}ms")
                if isinstance(result, (BaseModel, dict, str)):
                    logger.debug(f"Result = {result}")
                return result
            except Exception as e:
                duration = (time.time() - start) * 1000
                logger.error(f"✗ {func.__name__} failed after {duration:.2f}ms: {e}")
                raise e
        else:
            return func(self, *args, **kwargs)

    return wrapper


def logged_async(func):
    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        logger = getattr(self, "logger", None)
        if logger:
            start = time.time()
            logger.debug(f"Classname = {self.__class__.__name__}")
            logger.debug(f"Function = {func.__name__}")
            logger.debug(f"Args = {args}")
            logger.debug(f"Kwargs = {kwargs}")

            try:
                result = await func(self, *args, **kwargs)
                duration = (time.time() - start) * 1000
                logger.debug(f"← {func.__name__} completed in {duration:.2f}ms")
                if isinstance(result, (BaseModel, dict, str)):
                    logger.debug(f"Result = {result}")
                return result
            except Exception as e:
                duration = (time.time() - start) * 1000
                logger.error(f"✗ {func.__name__} failed after {duration:.2f}ms: {e}")
                raise e
        else:
            return await func(self, *args, **kwargs)

    return wrapper
