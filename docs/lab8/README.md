# Лаб 8 — Dockerfile бичих, Image бүтээх, ажиллуулах

Branch: `lab8-docker`

## Юу хийсэн

1. Төслийн (үл хөдлөх хөрөнгө зарах, түрээслэх) backend-ийн жижиг хэсгийг
   Лаб 5-д сонгосон NestJS (TypeScript) дээр бичсэн — [app/](../../app/):
   - `GET /listings?district=&type=&minPrice=&maxPrice=` — зарыг дүүрэг, төрөл,
     үнээр шүүнэ (US-01)
   - `GET /listings/:id` — нэг зарын мэдээлэл
   - `GET /health` — төлөв, хувилбар, серверийн нэр (контейнерийн ID)
   - `/` — шүүлтүүртэй зар хайх хуудас
2. [app/Dockerfile](../../app/Dockerfile) — multi-stage. Хамаарлын файлыг
   (`package.json`, `package-lock.json`) эх кодоос **өмнө** хуулж `npm ci` хийдэг
   тул код өөрчлөгдөхөд хамаарал суулгах layer кэшээс авагдана. Эцсийн image-д
   зөвхөн production хамаарал болон эмхэтгэсэн `dist/` орно, `node` хэрэглэгчээр
   ажиллана.
3. [app/.dockerignore](../../app/.dockerignore) — `node_modules`, `dist`, `.git`
   зэргийг build context-оос хассан.
4. Image бүтээж, контейнер ажиллуулж, браузераар шалгасан.
5. Кодод жижиг өөрчлөлт хийж (`APP_VERSION` `1.0` → `1.1`) дахин build хийн
   layer caching ажилласныг баталгаажуулсан.

## Ашигласан командууд

```powershell
docker --version
cd app

# Image бүтээх
docker build -t team10-realestate-api:1.0 .

# Контейнер ажиллуулах, шалгах
docker run -d --name team10-api -p 3000:3000 team10-realestate-api:1.0
docker ps --filter name=team10-api
docker logs team10-api
curl http://localhost:3000/health

# Кодод өөрчлөлт хийсний дараа дахин build
docker build --progress=plain -t team10-realestate-api:1.1 .
```

## Layer caching-ийн үр дүн

Дахин build хийхэд (`02-rebuild-cached.png`):

| Алхам | Үр дүн | Шалтгаан |
|---|---|---|
| `[build 3/7] COPY package.json package-lock.json ./` | CACHED | хамаарлын файл өөрчлөгдөөгүй |
| `[build 4/7] RUN npm ci` | CACHED | өмнөх layer өөрчлөгдөөгүй |
| `[build 5/7] COPY tsconfig*.json ./` | CACHED | өөрчлөгдөөгүй |
| `[build 6/7] COPY src ./src` | дахин ажилласан | эх код өөрчлөгдсөн |
| `[build 7/7] RUN npm run build` | дахин ажилласан (0.9 сек) | өмнөх layer өөрчлөгдсөн |
| `[stage-1 4/6] RUN npm ci --omit=dev` | CACHED | хамаарлын файл өөрчлөгдөөгүй |
| `[stage-1 5/6] COPY --from=build /app/dist ./dist` | дахин ажилласан | шинэ `dist` |

Эхний build-д `npm ci --omit=dev` дангаараа ~19 секунд зарцуулсан бол дахин
build бүхэлдээ хэдхэн секундэд дууссан.

## Хүлээлгэж өгөх зүйл

| Файл | Тайлбар |
|---|---|
| [app/Dockerfile](../../app/Dockerfile) | Dockerfile |
| [app/.dockerignore](../../app/.dockerignore) | build context-оос хасах файлууд |
| [01-app-running.png](01-app-running.png) | Апп контейнер дотроос `localhost:3000` дээр ажиллаж байгаа |
| [02-rebuild-cached.png](02-rebuild-cached.png) | Дахин build-ийн гаралт, CACHED мөрүүд |

## Тайланд оруулах тайлбар

Манай багийн үл хөдлөх хөрөнгийн зарын API-г (NestJS) multi-stage Dockerfile
ашиглан контейнержуулсан. Dockerfile-д `package.json`, `package-lock.json`-ийг
эх кодоос өмнө хуулж `npm ci` ажиллуулсан тул хамаарал суулгах layer нь зөвхөн
хамаарал өөрчлөгдөх үед л дахин бүтнэ. `team10-realestate-api:1.0` image-ийг
бүтээж, `docker run -p 3000:3000` командаар ажиллуулахад зар хайх хуудас
`localhost:3000` дээр нээгдсэн. Дараа нь эх кодод жижиг өөрчлөлт хийж дахин build
хийхэд `npm ci` алхмууд `CACHED` гэж гарч, зөвхөн `COPY src` болон
`npm run build` алхам дахин ажилласан нь layer caching зөв ажиллаж байгааг
харуулсан. Ингэснээр кодын өөрчлөлт бүрд image бүтээх хугацаа 20 гаруй секундээс
хэдхэн секунд болж буурсан.
