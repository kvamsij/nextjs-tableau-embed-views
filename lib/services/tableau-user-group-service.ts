import { TableauUserGroupRepository } from '@/lib/repositories/tableau-user-group-repository';

export class TableauUserGroupService {
  /**
   * Get domain override for a given domain
   * Useful for email domain extraction
   */
  static async getDomainOverride(domain: string): Promise<string | null> {
    try {
      return await TableauUserGroupRepository.getDomainOverride(domain);
    } catch (error) {
      console.error('Error fetching domain override:', error);
      return null;
    }
  }
}
