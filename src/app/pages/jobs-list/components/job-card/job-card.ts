import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  input,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Job } from '../../model/jobs-list.model';

@Component({
  selector: 'app-job-card',
  imports: [DatePipe],
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class JobCard {
  job: InputSignal<Job> = input.required<Job>();

  jobSelected: OutputEmitterRef<Job> = output<Job>();

  onClick(): void {
    this.jobSelected.emit(this.job());
  }
}
