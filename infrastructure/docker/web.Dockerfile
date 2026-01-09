FROM node:20-alpine

WORKDIR /repo

# Install dependencies (workspace-aware)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci

# Copy source
COPY apps/web ./apps/web

WORKDIR /repo/apps/web

ENV NODE_ENV=production
EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]

