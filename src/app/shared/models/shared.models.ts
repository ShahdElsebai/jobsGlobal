export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Country {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface WorkspaceMeta {
  id: string;
  incremental_id: number;
  page_name: string;
  alias: string;
  account_status: string;
  page_avatar: string;
  page_cover: string;
  company_email: string;
  country_id: number;
  industry_id: number;
  is_verified: number;
  is_verified_documents: number;
  date_created: string;
  date_updated: string;
}
