import type { Signal } from '@angular/core';
import type { WritableStateSource } from '@ngrx/signals';
import { Job, JobsState } from '../../model/jobs-list.model';

export interface JobsStateSignals {
  jobs: Signal<Job[]>;
  filter: Signal<string>;
  loading: Signal<boolean>;
  currentPage: Signal<number>;
  lastPage: Signal<number>;
  perPage: Signal<number>;
  appliedJobIds: Signal<Set<string>>;
  savedIds: Signal<Set<string>>;
  error: Signal<string | null>;
}

export interface JobsComputed {
  filteredJobs: Signal<Job[]>;
  initialLoading: Signal<boolean>;
  loadMoreDisabled: Signal<boolean>;
}

export interface JobsMethods {
  fetchJobs(): void;
  loadMore(): void;
  setFilter(value: string): void;
  markApplied(id: string): void;
  markSaved(id: string): void;
}

export type JobsStoreInstance = JobsStateSignals & JobsComputed & JobsMethods;

export type StoreCtx = WritableStateSource<JobsState> &
  JobsStateSignals &
  Partial<JobsComputed>;
