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


// const TABLE_NAME = 'dbo.tableau_user_group_from_domain';
const TABLE_NAME = 'dbo.tableau_user_group_domain';





export class TableauUserGroupRepository {
  /**
   * Get domain override by domain name
   */
  static async getDomainOverride(domain: string, tag: string): Promise<ResultsType | null> {
    // const result = await fetchSingleRow(
    //   `SELECT price_group_name, price_group_ids, currency, tableau_user_group_name FROM ${TABLE_NAME} WHERE tableau_user_group_domain_override = $1`,
    //   [domain.toLowerCase()]
    // );
    const result = await fetchSingleRow(
      `SELECT distinct array_to_string(array_agg(price_group_id) over(),'|') as price_group_ids,
first_value(price_group_name) over(order by price_group_name) as price_group_name,
first_value(currency) over(order by price_group_name) as currency
   FROM ${TABLE_NAME}
     join dbo.tableau_user_group_price_group tugpg using(tableau_user_group_id)
     join dbo.tableau_user_group using(tableau_user_group_id)
     join dbo.price_group using(price_group_id)
     where tracker_group = any($1)
     and tableau_user_group_domain_override = $2`,
      [`{${tag}}`, domain.toLowerCase()]
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

function transformPriceGroupIds(ids: string): string {
    return ids;
}
