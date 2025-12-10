import { ISession } from '@/actions/utils/session';
import { IViewDetailDataService } from '../services/view-detail-data-service';

export interface ViewDetailResult {
    success: boolean;
    data?: {
        embeddingUrl: string;
        token: string;
        params: { [key: string]: string };
    };
    error?: string;
}

export interface IViewDetailOrchestrator {
    executeViewDetailFlow(viewId: string, contentUrl: string | undefined, session: ISession): Promise<ViewDetailResult>;
}

export class ViewDetailOrchestrator implements IViewDetailOrchestrator {
    constructor(private dataService: IViewDetailDataService) {}

    async executeViewDetailFlow(viewId: string, contentUrl: string | undefined, session: ISession): Promise<ViewDetailResult> {
        try {
            // Get view details and VizQL data in parallel for better performance
            const [viewResult, vizqlResult] = await Promise.allSettled([
                this.dataService.getViewDetails(viewId, contentUrl, session),
                this.dataService.getVizQLData(session)
            ]);

            // Handle view details
            if (viewResult.status === 'rejected') {
                return {
                    success: false,
                    error: `Failed to load view details: ${viewResult.reason}`
                };
            }

            if (!viewResult.value.success) {
                return viewResult.value;
            }

            // Handle VizQL data
            let price_group_ids = '';
            if (vizqlResult.status === 'fulfilled' && vizqlResult.value.success && vizqlResult.value.data) {
                price_group_ids = String(vizqlResult.value.data.map(row => row['Ingredient']).join(','));
            }

            // Combine results
            const params = { price_group_ids };

            return {
                success: true,
                data: {
                    embeddingUrl: viewResult.value.data!.embeddingUrl,
                    token: viewResult.value.data!.token,
                    params
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}