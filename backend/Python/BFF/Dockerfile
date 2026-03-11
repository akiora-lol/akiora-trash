FROM python:3.13-slim

WORKDIR /app

# Установка зависимостей
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .


COPY BFF/ ./BFF/

# Переменные окружения по умолчанию
ENV PYTHONUNBUFFERED=1

ENV PYTHONPATH=/app


WORKDIR /app/BFF
CMD ["python", "api.py"]
