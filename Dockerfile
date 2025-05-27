FROM node:18-slim

ARG APP_NAME
ENV APP_NAME=${APP_NAME:-react-crm}

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables for React
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

# Build for production or use development mode
# RUN npm run build  # Uncomment for production build
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
