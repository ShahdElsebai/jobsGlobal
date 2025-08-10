import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobCard } from './job-card';
import { signal, InputSignal } from '@angular/core';
import { Job } from '../../model/jobs-list.model';

describe('JobCard', () => {
  let fixture: ComponentFixture<JobCard>;
  let component: JobCard;

  const mockJob: Job = {
    id: '1',
    title: 'Frontend Developer',
    description: 'Create UI',
    created_at: '2025-08-10T00:00:00Z',
    page: { name: 'Tech Corp' },
    location: {
      country: { id: 'US', name: 'USA' },
      city: { id: 'NY', name: 'New York' },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCard);
    component = fixture.componentInstance;

    // Cast signal as InputSignal<Job> to satisfy typing
    component.job = signal(mockJob) as unknown as InputSignal<Job>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render job title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(mockJob.title);
  });
});
