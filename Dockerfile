# Build dependencies
FROM node:14-alpine AS builder

WORKDIR /app
COPY ${PWD}/package*.json ./
RUN npm install --only=production --network-timeout 1000000
COPY . .
RUN npm run build:prod

# Integration
FROM node:14-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 5000
CMD [ "num", "run", "start:prod" ]
