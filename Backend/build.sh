#!/usr/bin/env bash
# Render build script for MilletMarg Django backend
# Exit immediately if a command exits with a non-zero status
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Collect static files into STATIC_ROOT using WhiteNoise
python manage.py collectstatic --no-input
