import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
  WritableSignal,
  input,
  InputSignal,
  OutputEmitterRef,
} from '@angular/core';

@Component({
  selector: 'app-jobs-pagination',
  templateUrl: './jobs-pagination.html',
  styleUrl: './jobs-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsPagination {
  page: WritableSignal<number> = signal(1);
  loadMore: OutputEmitterRef<number> = output<number>();

  loading: InputSignal<boolean> = input.required<boolean>();
  disabled: InputSignal<boolean> = input.required<boolean>();

  onLoadMore(): void {
    if (this.loading() || this.disabled()) return;
    this.page.update((p: number) => p + 1);
    this.loadMore.emit(this.page());
  }
}
