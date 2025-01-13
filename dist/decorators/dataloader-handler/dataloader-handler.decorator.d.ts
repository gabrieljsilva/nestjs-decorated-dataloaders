/**
 * Decorator used to define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
export declare function DataloaderHandler(key?: string): (target: any, propertyKey: string) => void;
