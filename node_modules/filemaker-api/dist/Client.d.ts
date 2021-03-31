import { FMResponse } from './Response';
import { AxiosRequestConfig } from 'axios';
export declare class Client {
    domain: string;
    db: string;
    getAuth: () => string;
    rowsPerPage: number;
    constructor(domain: string, db: string, getAuth: () => string);
    call<CustomRecord>(options: AxiosRequestConfig): Promise<FMResponse<CustomRecord>>;
    getDefaultOptions(): AxiosRequestConfig;
    findall<CustomRecord>(layout: string, page?: number, paginated?: boolean): Promise<FMResponse<CustomRecord>>;
    update<T>(layout: string, recid: number, fields: Partial<T>): Promise<import("./Parser").ParsedResponse>;
    create<T>(layout: string, fields: Partial<T>, scriptOptions?: {
        script: string;
        params?: string[];
    }): Promise<import("./Parser").ParsedResponse>;
    isAuthorized(): Promise<boolean>;
    customQuery<CustomRecord>(layout: string, fields?: {
        [key: string]: (string | number)[] | undefined;
    }): Promise<FMResponse<CustomRecord>>;
}
