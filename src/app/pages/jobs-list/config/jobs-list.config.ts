import { JobsState } from '../model/jobs-list.model';

export const initialState: JobsState = {
  jobs: [],
  loading: false,
  currentPage: 1,
  perPage: 11,
  lastPage: 1,
  filter: '',
  appliedJobIds: new Set<string>(),
  savedIds: new Set<string>(),
  error: null,
};
