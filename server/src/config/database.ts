import mysql from "mysql2/promise";
import { env } from "./env.js";

export const dbPool = env.USE_MYSQL
  ? mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      connectionLimit: 10
    })
  : null;

