FROM node:20
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npx prisma generate
RUN npm run build
RUN mkdir -p uploads/documents
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
