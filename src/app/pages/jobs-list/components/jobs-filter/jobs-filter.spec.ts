import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobsFilter } from './jobs-filter';

describe('JobsFilter', () => {
  let fixture: ComponentFixture<JobsFilter>;
  let component: JobsFilter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsFilter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterChanged after debounce', done => {
    component.filterChanged.subscribe(value => {
      expect(value).toBe('test');
      done();
    });

    component.onFilterChange('test');
  });
});
