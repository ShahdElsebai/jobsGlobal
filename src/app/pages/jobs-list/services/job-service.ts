import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Job, JobsApiResponse } from '../model/jobs-list.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly endpoint: string = `${environment.BASE_URL}/jobs/all`;

  jobs: WritableSignal<Job[]> = signal<Job[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);

  currentPage: WritableSignal<number> = signal(1);
  perPage: WritableSignal<number> = signal(10);
  lastPage: WritableSignal<number> = signal(1);

  constructor(private http: HttpClient) {}

  fetchJobs(): void {
    this.currentPage.set(1);
    this.jobs.set([]);
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    const params: URLSearchParams = new URLSearchParams({
      pagination_type: 'paginate',
      page: this.currentPage().toString(),
      per_page: this.perPage().toString(),
    });
    const url: string = `${this.endpoint}?${params.toString()}`;

    this.http.get<JobsApiResponse>(url).subscribe({
      next: (res: JobsApiResponse) => {
        if (this.currentPage() === 1) {
          this.jobs.set(res.data || []);
        } else {
          this.jobs.update((existing: Job[]) => [
            ...existing,
            ...(res.data || []),
          ]);
        }
        this.lastPage.set(res.meta?.last_page ?? this.currentPage());
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.currentPage() < this.lastPage()) {
      this.currentPage.update((p: number) => p + 1);
      this.loadJobs();
    }
  }
}
