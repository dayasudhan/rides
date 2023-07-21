# FROM node:18-alpine
# WORKDIR /app
# COPY . .
# RUN yarn install --production
# CMD ["node", "src/index.js"]
# EXPOSE 3000
# Base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the application code to the container
COPY . .

# Expose the port on which your NestJS application listens
EXPOSE 3000

# Set the command to start the NestJS application
CMD ["npm", "run", "start"]