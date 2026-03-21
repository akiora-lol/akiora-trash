from granian import Granian
from granian.constants import Interfaces

if __name__ == "__main__":
    Granian(
        "./app/api:app",
        address="0.0.0.0",
        port=8000,
        interface=Interfaces.ASGI,
    ).serve()
