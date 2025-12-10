import { ISession } from '@/actions/utils/session';

export interface TableauView {
    id: string;
    name: string;
    contentUrl: string;
    createdAt?: string;
    updatedAt?: string;
    project?: { name: string };
    workbook?: { name: string };
    owner?: { name: string };
    tags?: { tag: Array<{ label: string }> };
    previewImage?: string;
}

export interface TableauConfig {
    baseUrl: string;
    apiVersion: string;
}

export interface VizQLQuery {
    fields: Array<{
        fieldCaption: string;
        function?: string;
        sortPriority?: number;
        sortDirection?: 'ASC' | 'DESC';
        maxDecimalPlaces?: number;
        calculation?: string;
    }>;
    filters?: Array<{
        field: { fieldCaption: string; function?: string };
        filterType: string;
        values?: string[] | number[] | boolean[];
        exclude?: boolean;
        quantitativeFilterType?: string;
        min?: number;
        max?: number;
        [key: string]: unknown;
    }>;
    parameters?: Array<{
        parameterCaption: string;
        value: unknown;
    }>;
}

export interface VizQLQueryResult {
    data?: Array<Record<string, unknown>>;
    error?: string;
}

export interface VizQLOptions {
    debug?: boolean;
    returnFormat?: 'OBJECTS' | 'ARRAYS';
    disaggregate?: boolean;
    interpretFieldCaptionsAsFieldNames?: boolean;
}

export class TableauService {
    private config: TableauConfig;
    
    constructor(config: TableauConfig) {
        this.config = config;
    }

    async getViews(session: ISession): Promise<TableauView[]> {
        const params = new URLSearchParams({
            pageSize: '300',
            fields: 'project.description'
        });
        
        const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/sites/${session.siteId}/views?${params}`;
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Tableau-Auth': session.token,
            }
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch views: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data?.views?.view || [];
    }

    async getViewImage(viewId: string, session: ISession): Promise<string | null> {
        try {
            // Use lower resolution to reduce file size (default is high)
            const imageUrl = `${this.config.baseUrl}/api/${this.config.apiVersion}/sites/${session.siteId}/views/${viewId}/image`;
            const imageResponse = await fetch(imageUrl, {
                method: 'GET',
                headers: {
                    'X-Tableau-Auth': session.token,
                    'Accept': '*/*',
                },
                cache: 'no-store',
            });

            if (imageResponse.ok) {
                const buffer = await imageResponse.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType = imageResponse.headers.get('content-type') || 'image/png';
                return `data:${contentType};base64,${base64}`;
            }
        } catch (error) {
            console.warn(`Failed to fetch image for view ${viewId}:`, error);
        }
        return null;
    }

    async queryDataWithVizQL(datasourceLuid: string, query: VizQLQuery, session: ISession, options?: VizQLOptions): Promise<VizQLQueryResult> {
        const url = `${this.config.baseUrl}/api/v1/vizql-data-service/query-datasource`;
        const body = {
            datasource: {
                datasourceLuid
            },
            query,
            ...(options && { options })
        };

        console.log('VizQL Request Debug:', {
            url,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tableau-Auth': session.token.substring(0, 20) + '...',
            },
            body: JSON.stringify(body, null, 2)
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tableau-Auth': session.token,
            },
            body: JSON.stringify(body)
        });

        console.log('VizQL Response Debug:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('VizQL Error Response:', errorText);
            throw new Error(`Failed to execute VizQL query: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    }

    async getDataSourceMetadata(datasourceLuid: string, session: ISession): Promise<VizQLQueryResult> {
        const url = `${this.config.baseUrl}/api/v1/vizql-data-service/read-metadata`;
        const body = {
            datasource: {
                datasourceLuid
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tableau-Auth': session.token,
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to get datasource metadata: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async getDataSourceInfo(datasourceLuid: string, session: ISession): Promise<VizQLQueryResult> {
        const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/sites/${session.siteId}/datasources/${datasourceLuid}`;
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Tableau-Auth': session.token,
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to get datasource info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }
}