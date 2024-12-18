# Use the Ubuntu image as the base
FROM ubuntu:20.04

# Set a non-interactive frontend for apt-get (to avoid prompts during installation)
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && apt-get clean

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . /app

# Install Python dependencies from requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the port Flask runs on
EXPOSE 5000

# Command to run the Flask app
CMD ["python3", "app.py"]