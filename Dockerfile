FROM node:20-bullseye-slim

# Crea la working directory
WORKDIR /usr/src/app

# Copia i file di configurazione prima
COPY package*.json ./
RUN npm install

# Copia il codice sorgente
COPY . .

# Espone la porta
EXPOSE 3000

# Avvio normale, per fare hot-reloading (npm run dev)
CMD ["npm", "run", "start"]