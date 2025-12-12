import { fetchSingleRow } from '@/lib/repositories/data-repository';

const TABLE_NAME = 'dbo.tableau_user_group_from_domain';
// const TABLE_NAME = 'dbo.price_group';

export class TableauUserGroupRepository {
  /**
   * Get domain override by domain name
   */
  static async getDomainOverride(domain: string): Promise<string[] | null> {
    const sqlStatement = `SELECT tableau_user_group_name, price_group_ids FROM ${TABLE_NAME} WHERE tableau_user_group_domain_override = $1`;
    // const sqlStatement = `SELECT * FROM ${TABLE_NAME} WHERE tableau_user_group_domain_override = $1`;
    const result = await fetchSingleRow(
      sqlStatement,
      [domain]
    );
    console.log(result)
    // return result?.tableau_user_group_name as string | null;
    return result?.price_group_ids as string[] | null;
  }
}
