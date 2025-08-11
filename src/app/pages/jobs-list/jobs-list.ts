import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  WritableSignal,
  Signal,
  ViewChild,
} from '@angular/core';
import { JobCard } from './components/job-card/job-card';
import { JobsFilter } from './components/jobs-filter/jobs-filter';
import { JobsPagination } from './components/jobs-pagination/jobs-pagination';
import { JobService } from './services/job-service';
import { Job } from './model/jobs-list.model';
import { JobModal } from './components/job-modal/job-modal';

@Component({
  selector: 'app-jobs-list',
  imports: [JobCard, JobsFilter, JobsPagination, JobModal],
  templateUrl: './jobs-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class JobsList {
  filterKeyword: WritableSignal<string> = signal('');
  selectedJob: WritableSignal<Job | null> = signal<Job | null>(null);
  @ViewChild('jobModal') jobModal!: JobModal;

  constructor(public jobService: JobService) {
    this.jobService.fetchJobs();
  }

  filteredJobs: Signal<Job[]> = computed(() => {
    const keyword: string = this.filterKeyword().toLowerCase().trim();
    if (!keyword) return this.jobService.jobs();

    return this.jobService.jobs().filter((job: Job) => {
      const titleMatch: boolean = job.title.toLowerCase().includes(keyword);
      const locationString: string =
        `${job.location?.city?.name ?? ''} ${job.location?.country?.name ?? ''}`.toLowerCase();
      const locationMatch: boolean = locationString.includes(keyword);
      return titleMatch || locationMatch;
    });
  });

  initialLoading: Signal<boolean> = computed(
    () => this.jobService.loading() && this.jobService.jobs().length === 0
  );

  loadMoreDisabled: Signal<boolean> = computed(
    () =>
      this.jobService.loading() ||
      this.jobService.currentPage() >= this.jobService.lastPage()
  );

  openModalWithJob(job: Job): void {
    this.selectedJob.set(job);
    this.jobModal.open(job);
  }

  closeModal(): void {
    this.jobModal.close();
  }

  onFilterChange(keyword: string): void {
    this.filterKeyword.set(keyword);
  }

  onLoadMore(): void {
    this.jobService.loadMore();
  }
}
