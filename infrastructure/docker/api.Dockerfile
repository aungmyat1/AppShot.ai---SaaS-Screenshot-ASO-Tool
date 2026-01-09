##
## FastAPI (apps/api) — multi-stage, Alpine, production-ready.
## Build context is repo root.
##

FROM python:3.12-alpine AS builder
WORKDIR /wheels

# Build deps for common Python native packages (bcrypt/cryptography/lxml/pillow/asyncpg)
RUN apk add --no-cache \
  build-base \
  libffi-dev \
  openssl-dev \
  cargo \
  postgresql-dev \
  libxml2-dev \
  libxslt-dev \
  jpeg-dev \
  zlib-dev

COPY apps/api/requirements.txt .
RUN python -m pip install --upgrade pip && pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.12-alpine AS runtime
WORKDIR /app

# Runtime libs only
RUN apk add --no-cache \
  libffi \
  openssl \
  postgresql-libs \
  libxml2 \
  libxslt \
  jpeg \
  zlib \
  curl

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

COPY apps/api /app
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM runtime AS dev
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

