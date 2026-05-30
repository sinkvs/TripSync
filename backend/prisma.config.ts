import 'dotenv/config'; // подключаем dotenv чтобы загрузить переменные из .env
import { defineConfig, env } from 'prisma/config'; // импорт Prisma для создания конфигурации

// Экспортируем конфиг для Prisma CLI и клиента
export default defineConfig({

  // Блок настройки источника данных (БД)
  datasource: {

    // URL подключения берем из переменной окружения DATABASE_URL (тоже берется из .env)
    url: env('DATABASE_URL'),
  },
});
