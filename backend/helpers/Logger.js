/**
 * @description Winston logger config
 * @author Sourabh (CodeClouds)
 */

const { createLogger, transports, format } = require("winston");

module.exports = function (filename = "all-logs.log") {
    const logger = createLogger({
        format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
            format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
        ),
        transports: [
            new transports.File({
                filename: "./logs/" + filename,
                json: false,
                maxsize: 5242880,
                maxFiles: 5,
            }),
            new transports.Console({
                silent: true,
            }),
        ],
    });
    return logger;
};
