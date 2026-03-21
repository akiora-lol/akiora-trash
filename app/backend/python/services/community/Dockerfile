FROM python:3.14-slim

WORKDIR /app


COPY pyproject.toml .
RUN pip install --no-cache-dir -e .


COPY services/community/ ./services/community/
COPY shared/src/shared/ ./services/community/shared/

ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO
ENV PYTHONPATH=/app

# Запуск приложения
WORKDIR /app/services/community
CMD ["python", "main.py"]
