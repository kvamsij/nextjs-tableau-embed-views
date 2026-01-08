import { fetchSingleRow } from '@/lib/repositories/data-repository';

type ResultsType ={ 
    filters: {
        price_group_name: string;
    };
    customParams: {
        price_group_ids: string;
        currency: string;
        tableau_user_group_name: string;
    };
}


const TABLE_NAME = 'dbo.tableau_user_group_from_domain';





export class TableauUserGroupRepository {
  /**
   * Get domain override by domain name
   */
  static async getDomainOverride(domain: string): Promise<ResultsType | null> {
    const result = await fetchSingleRow(
      `SELECT price_group_name, price_group_ids, currency, tableau_user_group_name FROM ${TABLE_NAME} WHERE tableau_user_group_domain_override = $1`,
      [domain.toLowerCase()]
    );
        if(result){
            return {
                filters: {
                    price_group_name: result.price_group_name,
                },
                customParams: {
                    price_group_ids: transformPriceGroupIds(result.price_group_ids),
                    currency: result.currency,
                    tableau_user_group_name: result.tableau_user_group_name
                }
            };
        }
        return null;

  }
}

function transformPriceGroupIds(ids: number[]): string {
    if(ids.length === 0) return '';
    return ids.join('|');
}
