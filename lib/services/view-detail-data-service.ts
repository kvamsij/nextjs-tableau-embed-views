import { ISession } from '@/actions/utils/session';
import { JWTAuthenticationService } from '@/lib/services/authentication-service';
import { TableauUrlService } from '@/lib/services/tableau-url-service';
import { ViewDetailService } from '@/lib/services/view-detail-service';
import { TableauDataRepository } from '@/lib/repositories/tableau-data-repository';
import { TableauConfigFactory } from '@/lib/config/tableau-config';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface ViewDetailData {
    embeddingUrl: string;
    token: string;
    params: { [key: string]: string };
}

export interface DataServiceResult<T = ViewDetailData> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface VizQLDataRow {
    [key: string]: unknown;
}

export interface IViewDetailDataService {
    getViewDetails(viewId: string, contentUrl: string | undefined, session: ISession): Promise<DataServiceResult<ViewDetailData>>;
    getVizQLData(session: ISession): Promise<DataServiceResult<VizQLDataRow[]>>;
}

export class ViewDetailDataService implements IViewDetailDataService {
    private viewDetailService: ViewDetailService;
    private dataRepository: TableauDataRepository;

    constructor(dataRepository: TableauDataRepository) {
        // Initialize dependencies - Dependency Inversion
        const config = TableauConfigFactory.createDefaultConfig();
        const authService = new JWTAuthenticationService();
        const urlService = new TableauUrlService({
            baseUrl: config.baseUrl,
            siteId: process.env.SITE_ID || 'sandbox-nutritionintegrated'
        });

        this.viewDetailService = new ViewDetailService(authService, urlService);
        this.dataRepository = dataRepository;
    }

    async getViewDetails(viewId: string, contentUrl: string | undefined, session: ISession): Promise<DataServiceResult<ViewDetailData>> {
        try {
            const result = this.viewDetailService.prepareViewDetail(viewId, session, contentUrl);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error
                };
            }

            return {
                success: true,
                data: {
                    embeddingUrl: result.data!.embeddingUrl,
                    token: result.data!.token,
                    params: result.data!.params
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get view details'
            };
        }
    }

    async getVizQLData(session: ISession): Promise<DataServiceResult<VizQLDataRow[]>> {
        try {
            // Decode JWT to get company
            const decodedToken = jwtDecode<JwtPayload & { priceGroupIds: string }>(session.jwt);
            const price_group_ids = decodedToken.priceGroupIds.split(',').map(id => parseInt(id.trim(), 10));

            // This could be made configurable in the future
            // const datasourceId = "8a89f389-5e65-4605-a8be-f7b331a97332";
            const datasourceId = "54a458d5-3844-46ff-98a6-70a2f20a193f";

            const result = await this.dataRepository.queryDataWithVizQL(
                datasourceId,
                {
                    fields: [{
                        fieldCaption: 'Ingredient',
                        sortPriority: 1,
                        sortDirection: 'ASC'
                    }],
                    filters: [
                        {
                            field: { fieldCaption: 'Price Group Id' },
                            filterType: 'SET',
                            values: price_group_ids,
                            exclude: false
                        }
                    ],
                },
                session
            );


            if (result.error) {
                return {
                    success: false,
                    error: result.error
                };
            }

            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get VizQL data'
            };
        }
    }
}