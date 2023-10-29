import { createPool } from "mysql2/promise";
export const pool = await createPool({
  host: "localhost",
  user: "root",
  database: "facturacion",
  port: 3306,
  waitForConnections: true,
  timezone: "America/Caracas",
});
