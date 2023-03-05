export class Logger {
    private static isProduction = false;

    static log = (...data: any[]) => !this.isProduction && console.log(...data);
    static info = (...data: any[]) => !this.isProduction && console.info(...data);
    static warn = (...data: any[]) => !this.isProduction && console.warn(...data);
    static error = (...data: any[]) => !this.isProduction && console.error(...data);
}
