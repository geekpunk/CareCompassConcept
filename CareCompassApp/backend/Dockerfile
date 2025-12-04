FROM python:3.9-slim

# Set working directory to /app
WORKDIR /app

# Copy requirements first for caching
# We assume build context is the CareCompassApp root
COPY backend/requirements.txt backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN pip install gunicorn

# Copy backend code
COPY backend/ backend/
# Copy config
COPY config/ config/

# Set working directory to backend so relative paths in utils.py work
WORKDIR /app/backend

# Expose port 8080
ENV PORT 8080

# Run with Gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
