import { TableauService, VizQLQuery, VizQLOptions, VizQLQueryResult } from '@/lib/services/tableau-service';
import { ISession } from '@/actions/utils/session';

export interface ITableauDataRepository {
    queryDataWithVizQL(datasourceLuid: string, query: VizQLQuery, session: ISession, options?: VizQLOptions): Promise<VizQLQueryResult>;
}

export class TableauDataRepository implements ITableauDataRepository {
    constructor(private tableauService: TableauService) {}

    async queryDataWithVizQL(datasourceLuid: string, query: VizQLQuery, session: ISession, options?: VizQLOptions): Promise<VizQLQueryResult> {
        try {
            return await this.tableauService.queryDataWithVizQL(datasourceLuid, query, session, options);
        } catch (error) {
            console.error('Failed to query data with VizQL:', error);
            return {
                error: error instanceof Error ? error.message : 'Failed to execute VizQL query'
            };
        }
    }
}