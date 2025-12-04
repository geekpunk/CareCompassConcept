#!/bin/bash

# CareCompass Environment Setup
# Run this command to load variables into your shell:
# source set_env.sh

echo "Setting up CareCompass environment variables..."


# 1. Gemini API Key
# Get this from Google AI Studio
export GEMINI_API_KEY="YOUR KEY"

# 2. Encryption Key
# This key is used to encrypt/decrypt patient data.
# You can generate a new valid key by running: python3 backend/generate_key.py
export ENCRYPTION_KEY="YOUR KEY"

# 3. Firebase Credentials
export FIREBASE_SERVICE_ACCOUNT_JSON='{YOUR JSON SERVICE ACCOUNT JSON HERE}'

echo "Environment variables set! You can now run the backend."
