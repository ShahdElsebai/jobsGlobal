import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  InputSignal,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../model/jobs-list.model';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';
import { ApplicationFormItems } from './model/application-form.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrls: ['./application-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationForm {
  job: InputSignal<Job | null> = input<Job | null>(null);
  submitSuccess: OutputEmitterRef<string> = output<string>();
  cancelForm: OutputEmitterRef<void> = output<void>();

  submitting: WritableSignal<boolean> = signal<boolean>(false);
  fileError: WritableSignal<string | null> = signal<string | null>(null);
  selectedFile: File | null = null;

  // Optional local set to track applied jobs if you want
  appliedJobs: Set<string> = new Set<string>();

  form: FormGroup<ApplicationFormItems> = new FormGroup<ApplicationFormItems>({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    education: new FormControl('', Validators.required),
    position: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    coverLetter: new FormControl(''),
  });

  constructor(private toast: ToastService) {}

  onFileSelected(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.selectedFile = null;
      this.fileError.set(null);
      return;
    }

    const file: File = input.files[0];
    if (file.size > 3 * 1024 * 1024) {
      this.fileError.set('File size exceeds 3MB limit');
      this.selectedFile = null;
      this.toast.show('File size exceeds 3MB limit', ToastTypes.Error);
    } else {
      this.fileError.set(null);
      this.selectedFile = file;
      this.toast.show('CV attached ', ToastTypes.Info, 1800);
    }
  }

  isControlInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control: FormControl<string | null> = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid || this.fileError()) {
      this.form.markAllAsTouched();
      this.toast.show('Please fix errors before submitting', ToastTypes.Error);
      return;
    }

    this.submitting.set(true);

    setTimeout(() => {
      this.submitting.set(false);
      const jobId: string = this.job()?.id || '';
      if (jobId) {
        this.appliedJobs.add(jobId);
        this.toast.show(
          'Application submitted successfully!',
          ToastTypes.Success
        );
        this.submitSuccess.emit(jobId);
      }
    }, 1500);
  }
}
