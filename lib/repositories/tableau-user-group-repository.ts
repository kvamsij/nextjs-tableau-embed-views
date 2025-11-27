import { fetchSingleRow } from '@/lib/repositories/data-repository';

const TABLE_NAME = 'dbo.tableau_user_group_from_domain';

export class TableauUserGroupRepository {
  /**
   * Get domain override by domain name
   */
  static async getDomainOverride(domain: string): Promise<string | null> {
    const result = await fetchSingleRow(
      `SELECT tableau_user_group_name FROM ${TABLE_NAME} WHERE tableau_user_group_domain_override = $1`,
      [domain]
    );
    return result?.tableau_user_group_name as string | null;
  }
}
