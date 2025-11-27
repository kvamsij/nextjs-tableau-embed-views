import { IAuthenticationService } from './authentication-service';
import { ITableauUrlService } from './tableau-url-service';
import { ISession } from '@/actions/utils/session';

export interface ViewDetailData {
    viewId: string;
    contentUrl?: string;
    embeddingUrl: string;
    token: string;
}

export interface ViewDetailResult {
    success: boolean;
    data?: ViewDetailData;
    error?: string;
}

export interface IViewDetailService {
    prepareViewDetail(
        viewId: string, 
        session: ISession, 
        contentUrl?: string
    ): ViewDetailResult;
}

export class ViewDetailService implements IViewDetailService {
    constructor(
        private authService: IAuthenticationService,
        private urlService: ITableauUrlService
    ) {}

    prepareViewDetail(
        viewId: string, 
        session: ISession, 
        contentUrl?: string
    ): ViewDetailResult {
        try {
            // Validate authentication
            const authResult = this.authService.validateSession(session);
            if (!authResult.isValid) {
                return {
                    success: false,
                    error: authResult.error || 'Authentication failed'
                };
            }

            // Build embedding URL
            const embeddingUrl = this.urlService.buildViewUrl(viewId, contentUrl);

            return {
                success: true,
                data: {
                    viewId,
                    contentUrl,
                    embeddingUrl,
                    token: session.jwt
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to prepare view details'
            };
        }
    }
}