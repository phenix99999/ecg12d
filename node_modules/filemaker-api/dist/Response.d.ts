import { ParsedResponse } from './Parser';
declare type Record<CustomFields> = {
    id: number;
    fields: CustomFields;
};
export declare class FMResponse<CustomFields> {
    code: number;
    count?: number;
    records?: Record<CustomFields>[];
    error?: FMError;
    constructor(xmlResponse: ParsedResponse);
    hasError(): boolean;
    isEmpty(): boolean;
    throwError(): void;
}
interface FMError {
    code: number;
    message: string;
}
export {};
