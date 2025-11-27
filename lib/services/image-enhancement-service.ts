import { TableauView } from './tableau-service';

export interface ImageEnhancementOptions {
    enableBatchProcessing: boolean;
    maxConcurrentRequests: number;
    fallbackOnError: boolean;
}

export class ImageEnhancementService {
    private options: ImageEnhancementOptions;
    
    constructor(options: ImageEnhancementOptions = {
        enableBatchProcessing: true,
        maxConcurrentRequests: 5,
        fallbackOnError: true
    }) {
        this.options = options;
    }

    async enhanceViewsWithImages(
        views: TableauView[], 
        imageProvider: (viewId: string) => Promise<string | null>
    ): Promise<TableauView[]> {
        if (!this.options.enableBatchProcessing) {
            return this.processSequentially(views, imageProvider);
        }
        
        return this.processConcurrently(views, imageProvider);
    }

    private async processConcurrently(
        views: TableauView[], 
        imageProvider: (viewId: string) => Promise<string | null>
    ): Promise<TableauView[]> {
        const chunks = this.chunkArray(views, this.options.maxConcurrentRequests);
        const results: TableauView[] = [];

        for (const chunk of chunks) {
            const chunkResults = await Promise.allSettled(
                chunk.map(async (view) => {
                    const previewImage = await imageProvider(view.id);
                    return { ...view, previewImage: previewImage ?? undefined };
                })
            );

            const processedChunk = chunkResults.map((result, index) => 
                result.status === 'fulfilled' 
                    ? result.value 
                    : { ...chunk[index], previewImage: undefined }
            );

            results.push(...processedChunk);
        }

        return results;
    }

    private async processSequentially(
        views: TableauView[], 
        imageProvider: (viewId: string) => Promise<string | null>
    ): Promise<TableauView[]> {
        const results: TableauView[] = [];
        
        for (const view of views) {
            try {
                const previewImage = await imageProvider(view.id);
                results.push({ ...view, previewImage: previewImage ?? undefined });
            } catch (error) {
                if (this.options.fallbackOnError) {
                    results.push({ ...view, previewImage: undefined });
                } else {
                    throw error;
                }
            }
        }
        
        return results;
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}