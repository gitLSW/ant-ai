const winston = require('winston');
const { combine, printf } = winston.format;

const logLevels = {
    levels: {
        actor: 0,
        critic: 1,
        event: 2,
        info: 3, // Relevant Info (e.g. current Port)
    },
    colors: {
        actor: 'green',
        critic: 'yellow',
        event: 'blue',
        info: 'red'
    }
};

const logger = winston.createLogger({
    levels: logLevels.levels,
    format: printf(({ level, message }) => {
        return `${new Date().toISOString()} [${level}]: ${message}`;
    }),
    transports: [
        // Filepath is relative to package.json
        new winston.transports.File({ filename: 'log/progress.log', level: 'progress' }),
        new winston.transports.File({ filename: 'log/training.log', level: 'event' }),
        new winston.transports.Console({
            format: combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            level: 'info'
        })
    ]
});

winston.addColors(logLevels.colors);

module.exports = logger