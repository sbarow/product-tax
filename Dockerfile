# Dockerfile for ChromaDB
FROM ghcr.io/chroma-core/chroma:latest

# Set environment variables
ENV CHROMA_DB_IMPL=duckdb \
  CHROMA_SERVER_HOST=0.0.0.0 \
  CHROMA_SERVER_PORT=8000

# Expose Chroma server port internally
EXPOSE 8000

# Start ChromaDB server (use ENTRYPOINT with the correct command)
ENTRYPOINT ["chroma", "run", "--host", "0.0.0.0", "--port", "8000"]