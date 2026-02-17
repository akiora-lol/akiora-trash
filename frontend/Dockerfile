
# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on (e.g., 3000 for many dev servers)
EXPOSE 5173

# Define the command to run your app in development mode
CMD ["npm", "run", "dev"]
