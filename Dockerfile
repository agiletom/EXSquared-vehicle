# Use the official Node.js image as a base image
FROM node:16-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies (including global Nest CLI)
RUN npm install -g @nestjs/cli && npm install

# Copy the rest of your application code to the container
COPY . .

# Build the Nest.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Nest.js app using the built files
CMD ["npm", "run", "start:prod"]
