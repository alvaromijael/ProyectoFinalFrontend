# Dockerizing your Vite + React app

## Production (Nginx, multi-stage build)
1) Put these files at your project root:
   - `Dockerfile`
   - `.dockerignore`
   - `docker/nginx.conf`
   - `docker-compose.yml`
2) Build & run:
```bash
docker compose up --build -d
# open http://localhost:5173
```
3) Logs / stop:
```bash
docker compose logs -f
docker compose down
```

## Development (hot reload in a container)
1) Use `docker-compose.dev.yml`:
```bash
docker compose -f docker-compose.dev.yml up
# open http://localhost:5173
```
Edits on your host will live-reload via Vite HMR.
