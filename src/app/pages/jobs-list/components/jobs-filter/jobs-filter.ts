import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  output,
  OutputEmitterRef,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-jobs-filter',
  templateUrl: './jobs-filter.html',
  styleUrl: './jobs-filter.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsFilter {
  value: InputSignal<string> = input<string>('');

  filterChanged: OutputEmitterRef<string> = output<string>();

  private debounceTimer!: number;

  onFilterChange(next: string): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterChanged.emit(next);
    }, 500);
  }
}
