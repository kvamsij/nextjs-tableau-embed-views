export interface TableauUrlConfig {
    baseUrl: string;
    siteId: string;
}

export interface ITableauUrlService {
    buildViewUrl(viewId: string, contentUrl?: string): string;
}

export class TableauUrlService implements ITableauUrlService {
    constructor(private config: TableauUrlConfig) {}

    buildViewUrl(viewId: string, contentUrl?: string): string {
        // Use contentUrl if provided, otherwise fallback to viewId
        const viewPath = contentUrl || viewId;
        
        // Clean and format the view path
        const cleanViewPath = this.sanitizeViewPath(viewPath);
        
        return `${this.config.baseUrl}/t/${this.config.siteId}/views/${cleanViewPath}`;
    }

    private sanitizeViewPath(path: string): string {
        // Remove any leading/trailing slashes and clean the path
        return path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    }
}