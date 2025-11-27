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
}