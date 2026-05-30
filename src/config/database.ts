import { Sequelize } from 'sequelize';


class SequelizeSingleton {
  private static instance: Sequelize | null = null;

  private constructor() {}

  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new Sequelize({
        dialect: "postgres",
        host: process.env.POSTGRES_HOST ?? "localhost",
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        database: process.env.POSTGRES_DB ?? "mydb",
        username: process.env.POSTGRES_USER ?? "myuser",
        password: process.env.POSTGRES_PASSWORD ?? "mypassword",

        logging: process.env.NODE_ENV === "development" ? console.log : false,

        pool: {
          max: 10,
          min: 0,
          acquire: 30_000,
          idle: 10_000,
        },
      });
    }

    return SequelizeSingleton.instance;
  }

  public static async close(): Promise<void> {
    if (SequelizeSingleton.instance) {
      await SequelizeSingleton.instance.close();
      SequelizeSingleton.instance = null;
    }
  }
}

export default SequelizeSingleton;