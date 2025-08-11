import {
  PaginationLinks,
  PaginationMeta,
  WorkspaceMeta,
  Country,
  City,
} from '../../../shared/models/shared.models';

export interface JobsApiResponse {
  data: Job[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface Job {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  page: Page;
  location: Location | null;
  type: string;
}

export interface Location {
  country: Country;
  city: City;
}

export interface Page {
  name: string;
  work_space_meta_data?: WorkspaceMeta;
}
export interface JobsState {
  jobs: Job[];
  loading: boolean;
  currentPage: number;
  perPage: number;
  lastPage: number;
  filter: string;
  appliedJobIds: Set<string>;
  savedIds: Set<string>;
  error: string | null;
}
