import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewChild,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { JobCard } from './components/job-card/job-card';
import { JobsFilter } from './components/jobs-filter/jobs-filter';
import { JobsPagination } from './components/jobs-pagination/jobs-pagination';
import { Job } from './model/jobs-list.model';
import { JobModal } from './components/job-modal/job-modal';
import { JobsStore, JobsStoreInstance } from './state/jobs.store';

@Component({
  selector: 'app-jobs-list',
  imports: [JobCard, JobsFilter, JobsPagination, JobModal],
  templateUrl: './jobs-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class JobsList {
  readonly store: JobsStoreInstance = inject(JobsStore);

  selectedJob: WritableSignal<Job | null> = signal<Job | null>(null);

  @ViewChild('jobModal') jobModal!: JobModal;

  constructor() {
    this.store.fetchJobs();
  }

  filteredJobs: Signal<Job[]> = this.store.filteredJobs;
  initialLoading: Signal<boolean> = this.store.initialLoading;
  loadMoreDisabled: Signal<boolean> = this.store.loadMoreDisabled;

  openModalWithJob(job: Job): void {
    this.selectedJob.set(job);
    this.jobModal.open(job);
  }

  closeModal(): void {
    this.jobModal.close();
  }

  onFilterChange(keyword: string): void {
    this.store.setFilter(keyword);
  }

  onLoadMore(): void {
    this.store.loadMore();
  }

  onApplied(jobId: string): void {
    this.store.markApplied(jobId);
  }
}
