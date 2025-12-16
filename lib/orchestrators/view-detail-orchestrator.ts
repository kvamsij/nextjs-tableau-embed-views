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
            let price_group_name = '';
            if (vizqlResult.status === 'fulfilled' && vizqlResult.value.success && vizqlResult.value.data) {
                // price_group_ids = String(vizqlResult.value.data.map(row => row['Ingredient']).join(','));
                const resultData = vizqlResult.value.data as { price_group_ids: number[]; price_group_name: string };
                price_group_ids = String(resultData.price_group_ids);
                price_group_name = resultData.price_group_name;
                // Price Group Name
                // const
                // price_group_ids = String(vizqlResult.value.data);
            }

            // Combine results
            const params = {
                     ['price_group_parameter']:  price_group_ids.split(',').join('|'), 
                     ['Price Group Name']: price_group_name

             };
             console.log({params});

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