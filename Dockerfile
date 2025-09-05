# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files and install dependencies
COPY . .
RUN npm install
RUN npm run build

# Expose the port Vite uses by default for preview (you can override with env)
EXPOSE 8080

# Start the preview server
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT}"]
