import winston from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" 
        ? json()
        : combine(colorize(), devFormat)
    })
  ]
});

export default logger;
