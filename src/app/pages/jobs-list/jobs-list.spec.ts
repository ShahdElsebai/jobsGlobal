import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobsList } from './jobs-list';
import { JobService } from './services/job-service';
import { signal, WritableSignal } from '@angular/core';
import { Job } from './model/jobs-list.model';

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'Build UI features',
    created_at: '2025-08-10T00:00:00Z',
    page: { name: 'Tech Corp' },
    location: {
      country: { id: 'US', name: 'USA' },
      city: { id: 'NY', name: 'New York' },
    },
  },
  {
    id: '2',
    title: 'Backend Engineer',
    description: 'Build APIs',
    created_at: '2025-08-09T00:00:00Z',
    page: { name: 'Innovate Ltd' },
    location: {
      country: { id: 'CA', name: 'Canada' },
      city: { id: 'TO', name: 'Toronto' },
    },
  },
];

// Mock JobService
class MockJobService {
  jobs: WritableSignal<Job[]> = signal(mockJobs);
  loading = signal(false);
  currentPage = signal(1);
  lastPage = signal(2);

  fetchJobs = jasmine.createSpy('fetchJobs').and.callFake(() => {
    this.jobs.set(mockJobs);
    this.loading.set(false);
  });

  loadMore = jasmine.createSpy('loadMore').and.callFake(() => {
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);
    this.jobs.update(jobs => [...jobs]); // Simulate load more
  });
}

describe('JobsList', () => {
  let fixture: ComponentFixture<JobsList>;
  let component: JobsList;
  let jobService: MockJobService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: JobService, useClass: MockJobService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsList);
    component = fixture.componentInstance;
    jobService = TestBed.inject(JobService) as unknown as MockJobService;

    // Trigger initial fetch
    jobService.fetchJobs();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs from the service', () => {
    expect(jobService.fetchJobs).toHaveBeenCalled();
    expect(component.filteredJobs().length).toBe(mockJobs.length);
  });

  it('should filter jobs based on keyword', () => {
    component.onFilterChange('backend');
    fixture.detectChanges();

    const filtered = component.filteredJobs();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title.toLowerCase()).toContain('backend');
  });

  it('should call loadMore on service when onLoadMore is triggered', () => {
    component.onLoadMore();
    expect(jobService.loadMore).toHaveBeenCalled();
  });
});
