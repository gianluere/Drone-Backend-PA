FROM node:20-bullseye-slim

# Crea la working directory
WORKDIR /usr/src/app

# Copia i file di configurazione prima (per cache)
COPY package*.json ./
RUN npm install

# Copia il codice sorgente
COPY . .

# Espone la porta (se usi process.env.PORT = 3000)
EXPOSE 3000

# Avvia con hot-reloading (ts-node-dev o nodemon)
CMD ["npm", "run", "dev"]