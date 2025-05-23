# Use an official Python base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file from your server directory
COPY server/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app code (including the server/ folder)
COPY server /app/server
# Expose the port your Flas app runs on
EXPOSE 5000
# Set the Flask app location
ENV FLASK_APP=server/app.py
# Run the app (adjust the command if needed)
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]