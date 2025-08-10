import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { JobService } from './services/job-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-jobs-list',
  imports: [DatePipe],
  templateUrl: './jobs-list.html',
  styleUrl: './jobs-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsList {
  jobService: JobService = inject(JobService);

  constructor() {
    this.jobService.fetchJobs();
  }
}
