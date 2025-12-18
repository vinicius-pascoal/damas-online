FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 4000

# Comando para desenvolvimento com hot reload (nodemon)
CMD ["npm", "run", "dev"]
