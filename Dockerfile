FROM node:18

# Creează folder pentru app
WORKDIR /usr/src/app

# Copiază fișierele proiectului
COPY package*.json ./
RUN npm install

COPY . .

# Expune portul (Render folosește automat variabila PORT)
EXPOSE 10000
CMD [ "node", "index.js" ]
