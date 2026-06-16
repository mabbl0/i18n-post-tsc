export const enum LogLevel {
    Error,
    Warning,
    Info,
    Verbose,
    Debug,
}
type StrLogLevel = 'error' | 'debug' | 'warning' | 'verbose' | 'info';

var currentLogLevel: LogLevel = LogLevel.Info;

/**
 * set the log level
 * @param logLevel the log level wanted
 */
export function setLogLevel(logLevel: LogLevel) {
    currentLogLevel = logLevel;
}

/**
 * set the log level by the string log level
 * @param strLogLevel the log level wanted in string
 */
export function setLogLevelByStr(strLogLevel: StrLogLevel) {
    switch (strLogLevel) {
        case 'error':
            currentLogLevel = LogLevel.Error;
            break;
        case 'debug':
            currentLogLevel = LogLevel.Debug;
            break;
        case 'warning':
            currentLogLevel = LogLevel.Warning;
            break;
        case 'verbose':
            currentLogLevel = LogLevel.Verbose;
            break;
        case 'info':
            currentLogLevel = LogLevel.Info;
            break;
        default:
            break;
    }
}

/**
 * log a message depending of its log level
 * @param msgLogLevel the log level of the message to print
 * @param message the message to print
 * @param optionalParams the optional parameter for the console.log
 */
export function log(msgLogLevel: LogLevel, message?: any, ...optionalParams: any[]) {
    if(msgLogLevel <= currentLogLevel) {
        if(msgLogLevel == LogLevel.Error) {
            console.error(message, ...optionalParams);
        }
        else if(msgLogLevel == LogLevel.Warning) {
            console.warn(message, ...optionalParams);
        }
        else {
            console.log(message, ...optionalParams);
        }
    }
}
