import { TableauConfig } from '@/lib/services/tableau-service';
import { ImageEnhancementOptions } from '@/lib/services/image-enhancement-service';

export class TableauConfigFactory {
    static createDefaultConfig(): TableauConfig {
        return {
            baseUrl: process.env.TABLEAU_SERVER_URL || 'https://10ax.online.tableau.com',
            apiVersion: process.env.TABLEAU_API_VERSION || '3.20'
        };
    }

    static createImageEnhancementOptions(): ImageEnhancementOptions {
        return {
            enableBatchProcessing: true,
            maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5'),
            fallbackOnError: true
        };
    }
}