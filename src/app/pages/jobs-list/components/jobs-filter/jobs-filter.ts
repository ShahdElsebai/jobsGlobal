import {
  ChangeDetectionStrategy,
  Component,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-jobs-filter',
  templateUrl: './jobs-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsFilter {
  filterKeyword: WritableSignal<string> = signal('');
  filterChanged: OutputEmitterRef<string> = output<string>();

  private debounceTimer!: number;

  onFilterChange(value: string): void {
    this.filterKeyword.set(value);

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterChanged.emit(this.filterKeyword());
    }, 500);
  }
}
