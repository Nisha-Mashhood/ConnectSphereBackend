import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import config from "../../config/env-config";

const isProduction = config.node_env === "production" || config.node_env === "staging";
const logtailToken = config.logToken || process.env.BETTERSTACK_LOG_TOKEN || "";
const logtailEndpoint = config.logEndPoint || process.env.BETTERSTACK_LOG_ENDPOINT;

// Create Logtail instance only when we have valid token
let logtailTransport: LogtailTransport | null = null;

if (logtailToken && isProduction) {
  try {
    const logtail = new Logtail(logtailToken, {
      endpoint: logtailEndpoint || undefined,
    });

    logtailTransport = new LogtailTransport(logtail);
  } catch (err) {
    console.error("Failed to initialize BetterStack/Logtail:", err);
  }
}

const logger = winston.createLogger({
  level: config.logLevel || "info",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr ? " " + metaStr : ""}`;
    })
  ),

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    ...(logtailTransport ? [logtailTransport] : []),
  ],
});

if (!logtailToken && isProduction) {
  logger.warn(
    "BetterStack/Logtail token is missing in production environment!\n" +
    "Cloud logging is disabled. Check your environment variables."
  );
}

if (config.node_env !== "production") {
  logger.debug("Logger initialized successfully (development mode)");
}

export default logger;