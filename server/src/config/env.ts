import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET ?? "change_this_to_a_long_random_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  USE_MYSQL: process.env.USE_MYSQL === "true",
  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_NAME: process.env.DB_NAME ?? "social_app",
  DB_USER: process.env.DB_USER ?? "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? ""
};

