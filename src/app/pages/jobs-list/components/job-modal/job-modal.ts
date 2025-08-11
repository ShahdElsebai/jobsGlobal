import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';
import { Job } from '../../model/jobs-list.model';
import { CommonModule } from '@angular/common';
import { ApplicationForm } from '../application-form/application-form';

@Component({
  selector: 'app-job-modal',
  standalone: true,
  imports: [CommonModule, ApplicationForm],
  templateUrl: './job-modal.html',
  styleUrls: ['./job-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobModal {
  job: WritableSignal<Job | null> = signal(null);

  isOpen: WritableSignal<boolean> = signal(false);

  applied: WritableSignal<boolean> = signal(false);
  applyJob: WritableSignal<Job | null> = signal<Job | null>(null);
  saveJob: WritableSignal<Job | null> = signal<Job | null>(null);

  showApplicationForm: WritableSignal<boolean> = signal(false);

  open(job: Job): void {
    this.job.set(job);
    this.isOpen.set(true);
    this.applied.set(false);
    this.showApplicationForm.set(false);
  }

  // Close modal
  close(): void {
    this.isOpen.set(false);
    this.job.set(null);
    this.showApplicationForm.set(false);
  }

  applyClicked(): void {
    if (!this.applied() && this.job()) {
      this.applyJob.set(this.job());
      this.showApplicationForm.set(true);
    }
  }

  onSubmitSuccess(): void {
    this.applied.set(true);
    this.showApplicationForm.set(false);
  }

  cancelApplication(): void {
    this.showApplicationForm.set(false);
  }
  saveClicked(): void {
    if (this.job()) {
      this.saveJob.set(this.job());
    }
  }
}
