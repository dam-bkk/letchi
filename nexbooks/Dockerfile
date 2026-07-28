FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Generate client, create + seed the demo SQLite DB, then build.
# The seeded DB is baked into the image: demo resets on each redeploy by design.
RUN npx prisma generate \
  && npx prisma migrate deploy \
  && npx tsx prisma/seed.ts \
  && npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 DATABASE_URL="file:./prisma/dev.db"
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma/dev.db ./prisma/dev.db
EXPOSE 3000
CMD ["node", "server.js"]
