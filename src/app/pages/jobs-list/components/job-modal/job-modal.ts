import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';
import { Job } from '../../model/jobs-list.model';

@Component({
  selector: 'app-job-modal',
  standalone: true,
  templateUrl: './job-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobModal {
  job: WritableSignal<Job | null> = signal(null);

  closeModal: WritableSignal<boolean> = signal(false);
  applied: WritableSignal<boolean> = signal(false);

  applyJob: WritableSignal<Job | null> = signal<Job | null>(null);
  saveJob: WritableSignal<Job | null> = signal<Job | null>(null);

  close(): void {
    this.closeModal.set(true);
  }

  applyClicked(): void {
    if (!this.applied() && this.job()) {
      this.applied.set(true);
      this.applyJob.set(this.job());
    }
  }

  saveClicked(): void {
    if (this.job()) {
      this.saveJob.set(this.job());
    }
  }
}
