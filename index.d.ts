declare module 'wfl' {

    export function info(message: any): void;

    export function error(message: any): void;

    export function debug(message: any): void;

    export function notice(message: any): void;

    export function warning(message: any): void;

    export function critical(message: any): void;

}