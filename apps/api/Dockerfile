FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --ignore-scripts
COPY apps/api apps/api
RUN npm run prisma:generate -w @pulsechat/api && npm run build -w @pulsechat/api
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
EXPOSE 4000
CMD ["npm","run","start","-w","@pulsechat/api"]
