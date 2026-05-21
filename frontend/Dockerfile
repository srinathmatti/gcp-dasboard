# Use an official Node.js base image with Alpine for lightweight builds
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install npm packages
RUN npm install

# Copy the rest of the frontend source files
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start Vite dev server and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
