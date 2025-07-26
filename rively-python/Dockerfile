# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the NLTK data directory
RUN mkdir -p /usr/share/nltk_data

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt', download_dir='/usr/share/nltk_data'); nltk.download('stopwords', download_dir='/usr/share/nltk_data')"

# Set NLTK_DATA environment variable (Important!)
ENV NLTK_DATA=/usr/share/nltk_data

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV ENVIRONMENT=prod

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
