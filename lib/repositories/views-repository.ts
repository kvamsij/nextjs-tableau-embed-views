import { TableauView, TableauService } from '@/lib/services/tableau-service';
import { ImageEnhancementService } from '@/lib/services/image-enhancement-service';
import { ISession } from '@/actions/utils/session';

export interface IViewsRepository {
    getAllViewsWithImages(session: ISession): Promise<TableauView[]>;
}

export class TableauViewsRepository implements IViewsRepository {
    constructor(
        private tableauService: TableauService,
        private imageService: ImageEnhancementService
    ) {}

    async getAllViewsWithImages(session: ISession): Promise<TableauView[]> {
        try {
            // Fetch base views data
            const views = await this.tableauService.getViews(session);
            
            if (views.length === 0) {
                return [];
            }

            // Enhance views with images using the image service
            // const viewsWithImages = await this.imageService.enhanceViewsWithImages(
            //     views,
            //     (viewId: string) => this.tableauService.getViewImage(viewId, session)
            // );

            // return viewsWithImages;
            return views;
        } catch (error) {
            console.error('Failed to fetch views with images:', error);
            throw new Error('Unable to load Tableau views. Please try again later.');
        }
    }
}