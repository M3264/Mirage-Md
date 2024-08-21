# Use an official Node.js runtime as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure ffmpeg is installed
RUN apt-get update && apt-get install -y ffmpeg

# Expose the port your app runs on
EXPOSE 3000

# Command to run the bot
CMD ["node", "index.js"]
