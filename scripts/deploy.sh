#!/usr/bin/env bash

# Must stop on error, unset variable, or error in a pipeline
set -euo pipefail

# Check that IMAGE_TAG is set
: "${IMAGE_TAG:?IMAGE_TAG is required}"
REGISTRY=236554611831.dkr.ecr.eu-west-3.amazonaws.com
COMPOSE="docker compose -f compose.yaml -f compose.prod.yaml"

# Be on the root of the project, so that relative paths work correctly
cd "$(dirname "$0")/.."

# Log in to ECR
aws ecr get-login-password --region eu-west-3 \
  | docker login --username AWS --password-stdin "$REGISTRY"

$COMPOSE pull backend frontend
$COMPOSE up -d --no-build
$COMPOSE ps

