# устанавливаем официальный образ Node.js
FROM node:20

# указываем рабочую (корневую) директорию
WORKDIR /ST_server

# копируем основные файлы приложения в рабочую директорию
COPY ./ST_server/package*.json ./

# устанавливаем указанные зависимости NPM на этапе установки образа
RUN npm install

# после установки копируем все файлы проекта в корневую директорию
COPY ./ST_server ./

RUN npm run build
# запускаем основной скрипт в момент запуска контейнера
CMD ["npm", "start"]