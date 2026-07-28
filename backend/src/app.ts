import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRoutes } from "./routes/index.js";

const openapiPath = path.resolve(process.cwd(), "src/config/openapi.yaml");
let swaggerDocument: any;
try {
  swaggerDocument = YAML.load(openapiPath);
} catch {
  swaggerDocument = {};
}

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );
  app.use(compression());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  if (swaggerDocument && Object.keys(swaggerDocument).length > 0) {
    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  app.use("/api/v1", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};


