import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Job, JobsApiResponse } from '../model/jobs-list.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http: HttpClient = inject(HttpClient);
  private readonly endpoint: string = `${environment.BASE_URL}`;

  jobs: WritableSignal<Job[]> = signal<Job[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(true);

  fetchJobs(): void {
    this.loading.set(true);
    this.http
      .get<JobsApiResponse>(
        `${this.endpoint}/jobs/all?pagination_type=paginate&per_page=11`
      )
      .subscribe({
        next: (res: JobsApiResponse) => {
          this.jobs.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.jobs.set([]);
          this.loading.set(false);
        },
      });
  }
}
