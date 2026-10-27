FROM node:24-slim

# O Prisma precisa do OpenSSL no Linux
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Só os arquivos de dependência primeiro: o Docker reaproveita essa camada
#    em cache enquanto o package.json não mudar
COPY package*.json prisma.config.ts* ./
RUN npm ci

# 2) Schema e migrações do Prisma, e geração do client
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

# 3) Código da aplicação
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/app.js"]