interface DynamicDict {
    [key: string]: Object[];
}
interface RelatedSets {
    [key: string]: {
        count: number;
        records: Record[];
    };
}
interface Record {
    relatedsets?: RelatedSets;
    fields: DynamicDict;
    id: number;
}
export interface ParsedResponse {
    code: number;
    count?: number;
    records?: Record[];
}
export declare function extractResponse(data: string): ParsedResponse;
export {};
