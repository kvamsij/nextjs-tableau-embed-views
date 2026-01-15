import { TableauUserGroupRepository } from '@/lib/repositories/tableau-user-group-repository';


type ResultsType = { 
    filters: {
        price_group_name: string;
      };
    customParams: {
        price_group_ids: string;
        currency: string;
        tableau_user_group_name: string;
      };
}


export class TableauUserGroupService {
  /**
   * Get domain override for a given domain
   * Useful for email domain extraction
   */
  static async getDomainOverride(domain: string, tag: string): Promise<ResultsType | null> {
    try {
      return await TableauUserGroupRepository.getDomainOverride(domain, tag);
    } catch (error) {
      console.error('Error fetching domain override:', error);
      return null;
    }
  }
}
