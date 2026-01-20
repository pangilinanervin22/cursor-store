#!/bin/bash

# Docker build script for cursor-store

# Build the Docker image
docker build -t cursor-store:latest .

# Tag for Azure Container Registry (replace with your registry details)
# docker tag cursor-store:latest <registry-name>.azurecr.io/cursor-store:latest

echo "Docker image built successfully!"
echo "To push to Azure Container Registry, run:"
echo "  docker tag cursor-store:latest <registry-name>.azurecr.io/cursor-store:latest"
echo "  docker push <registry-name>.azurecr.io/cursor-store:latest"
