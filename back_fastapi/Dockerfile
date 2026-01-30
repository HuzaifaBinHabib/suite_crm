FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure the wait script is executable
RUN chmod +x wait-for-postgres.sh

EXPOSE 8000

# Updated "db" to "my_postgres" to match your docker-compose service name
CMD ["./wait-for-postgres.sh", "my_postgres", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]