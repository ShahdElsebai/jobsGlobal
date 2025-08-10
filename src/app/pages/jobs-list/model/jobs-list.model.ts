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
}

export interface Location {
  country: Country;
  city: City;
}

export interface Page {
  name: string;
  work_space_meta_data: WorkspaceMeta;
}
