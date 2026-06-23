# MinIO for Railway — bakes the server start command into the image
# so no dashboard "custom start command" is needed.
FROM minio/minio:latest
# MINIO_ROOT_USER / MINIO_ROOT_PASSWORD come from Railway env vars.
# Data dir /data — attach a Railway volume here for persistence (optional).
CMD ["server", "/data", "--console-address", ":9001"]
