'use server';

import { TableauUserGroupService } from '@/lib/services/tableau-user-group-service';

/**
 * Get domain override for email domain
 * Useful for extracting company from email
 * @param domain - Email domain (e.g., from user@sis.com)
 */
export async function getDomainOverride(domain: string) {
  const data =  await TableauUserGroupService.getDomainOverride(domain);
  console.log({data});
  return data;
}
