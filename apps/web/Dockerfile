FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --ignore-scripts
COPY apps/web apps/web
RUN npm run build -w @pulsechat/web
EXPOSE 3000
CMD ["npm","run","start","-w","@pulsechat/web"]
