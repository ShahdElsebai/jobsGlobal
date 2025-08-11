import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { Job } from '../../model/jobs-list.model';
import { CommonModule } from '@angular/common';
import { ApplicationForm } from '../application-form/application-form';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';

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
  savedIds: WritableSignal<Set<string>> = signal(new Set());
  isSaved: WritableSignal<boolean> = signal(false);
  saveJob: WritableSignal<Job | null> = signal<Job | null>(null);

  showApplicationForm: WritableSignal<boolean> = signal(false);

  appliedJobIds: InputSignal<Set<string>> = input<Set<string>>(new Set());

  appliedJob: OutputEmitterRef<string> = output<string>();

  constructor(private toast: ToastService) {}

  open(job: Job): void {
    this.job.set(job);
    this.isOpen.set(true);
    this.applied.set(this.appliedJobIds().has(job.id));
    this.isSaved.set(this.savedIds().has(job.id));
    this.showApplicationForm.set(false);
  }

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
    const id: string | undefined = this.job()?.id;
    if (id) {
      this.applied.set(true);
      this.appliedJob.emit(id);
      this.toast.show(
        'Application submitted successfully!',
        ToastTypes.Success
      );
    }
    this.showApplicationForm.set(false);
    this.close();
  }

  cancelApplication(): void {
    this.showApplicationForm.set(false);
  }
  saveClicked(): void {
    const j: Job | null = this.job();
    if (!j || this.isSaved()) return;
    this.saveJob.set(j);

    this.savedIds.update((prev: Set<string>) => {
      const next: Set<string> = new Set<string>(prev);
      next.add(j.id);
      return next;
    });
    this.isSaved.set(true);

    this.toast.show('Saved successfully!', ToastTypes.Success);
    this.close();
  }
}
