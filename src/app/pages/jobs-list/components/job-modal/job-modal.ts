import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  WritableSignal,
  inject,
  Signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationForm } from '../application-form/application-form';
import { Job } from '../../model/jobs-list.model';
import { JobsStore } from '../../state/jobs.store';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';
import { JobsStoreInstance } from '../../state/model/jobs.store.model';

@Component({
  selector: 'app-job-modal',
  standalone: true,
  imports: [CommonModule, ApplicationForm],
  templateUrl: './job-modal.html',
  styleUrls: ['./job-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobModal {
  private readonly store: JobsStoreInstance = inject(JobsStore);
  private readonly toast: ToastService = inject(ToastService);

  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDivElement>;

  job: WritableSignal<Job | null> = signal<Job | null>(null);
  isOpen: WritableSignal<boolean> = signal(false);

  applied: Signal<boolean> = computed(() => {
    const j: Job | null = this.job();
    return j ? this.store.appliedJobIds().has(j.id) : false;
  });
  isSaved: Signal<boolean> = computed(() => {
    const j: Job | null = this.job();
    return j ? this.store.savedIds().has(j.id) : false;
  });

  applyJob: WritableSignal<Job | null> = signal<Job | null>(null);
  saveJob: WritableSignal<Job | null> = signal<Job | null>(null);
  showApplicationForm: WritableSignal<boolean> = signal(false);

  open(job: Job): void {
    this.job.set(job);
    this.isOpen.set(true);
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
      this.store.markApplied(id);
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
    this.store.markSaved(j.id);
    this.toast.show('Saved successfully!', ToastTypes.Success);
    this.close();
  }
}
