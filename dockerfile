FROM node:21-alpine3.19

WORKDIR /usr/src/app

# Copiar solo package.json y package-lock.json primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos de configuración
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Crear directorio src vacío (se montará como volumen)
RUN mkdir -p src

EXPOSE 3003