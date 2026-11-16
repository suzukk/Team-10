# syntax=docker/dockerfile:1

# ---------- 1-р шат: TypeScript-ийг эмхэтгэх ----------
FROM node:22-alpine AS build
WORKDIR /app

# Layer caching: хамаарлын файлыг эх кодоос ӨМНӨ хуулна. package*.json
# өөрчлөгдөөгүй бол доорх `npm ci` layer кэшээс авагдана.
COPY package.json package-lock.json ./
RUN npm ci

# Эх код байнга өөрчлөгддөг тул хамгийн сүүлд хуулна.
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ---------- 2-р шат: ажиллуулах жижиг image ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Зөвхөн production хамаарал (TypeScript, тестийн сан орохгүй).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY public ./public

# root биш хэрэглэгчээр ажиллуулна.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
