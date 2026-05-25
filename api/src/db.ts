import { Sequelize } from "sequelize";
import pgvector from "pgvector/sequelize";
export const sequelize = new Sequelize(
  process.env.PGDATABASE as string,
  process.env.PGUSER as string,
  process.env.PGPASSWORD as string,
  {
    host: process.env.PGHOST as string,
    dialect: "postgres",
    ssl: process.env.PGSSLMODE === "require",
  },
);
pgvector.registerType(Sequelize);
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected ");
    await import("./models/user.model.js");
    await import("./models/document.model.js");
    await import("./models/documentChunk.model.js");
    await import("./models/chat.model.js");
    await import("./models/messages.model.js");
    await import("./models/associations.js");
    // await sequelize.sync();
    // console.log("Database synced");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default sequelize;
