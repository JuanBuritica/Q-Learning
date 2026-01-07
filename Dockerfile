
# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /code

# Copy requirements
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the app directory
COPY ./app /code/app

# Expose port (Cloud Run sets $PORT environment variable, default 8080)
ENV PORT=8080

# Command to run the application
# We listen on 0.0.0.0:$PORT
CMD uvicorn app.backend.main:app --host 0.0.0.0 --port ${PORT}
