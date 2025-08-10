import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputSignal, provideZonelessChangeDetection } from '@angular/core';
import { JobsPagination } from './jobs-pagination';
import { signal } from '@angular/core';

describe('JobsPagination', () => {
  let fixture: ComponentFixture<JobsPagination>;
  let component: JobsPagination;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsPagination],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsPagination);
    component = fixture.componentInstance;

    // Cast signals as InputSignal<boolean> to satisfy typing
    component.loading = signal(false) as unknown as InputSignal<boolean>;
    component.disabled = signal(false) as unknown as InputSignal<boolean>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit loadMore when onLoadMore called and not loading or disabled', () => {
    spyOn(component.loadMore, 'emit');

    component.onLoadMore();

    expect(component.loadMore.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit loadMore when loading is true', () => {
    component.loading = signal(true) as unknown as InputSignal<boolean>;
    spyOn(component.loadMore, 'emit');

    component.onLoadMore();

    expect(component.loadMore.emit).not.toHaveBeenCalled();
  });

  it('should not emit loadMore when disabled is true', () => {
    component.disabled = signal(true) as unknown as InputSignal<boolean>;
    spyOn(component.loadMore, 'emit');

    component.onLoadMore();

    expect(component.loadMore.emit).not.toHaveBeenCalled();
  });
});
