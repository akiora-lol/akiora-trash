FROM python:3.13-slim

WORKDIR /app

# Установка зависимостей
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .


COPY SocketService/ ./SocketService/

# Переменные окружения по умолчанию
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO
ENV PYTHONPATH=/app

# Запуск приложения
WORKDIR /app/SocketService
CMD ["python", "main.py"]
