export interface TableauUserGroup {
  idx: number;
  tableau_user_group_id: number;
  tableau_user_group_name: string;
  tableau_user_group_domain: string;
  tableau_user_group_domain_override: string;
}

export interface TableauUserGroupResult {
  success: boolean;
  data?: TableauUserGroup[];
  error?: string;
}

export interface SingleTableauUserGroupResult {
  success: boolean;
  data?: TableauUserGroup | null;
  error?: string;
}
