import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { signal, WritableSignal } from '@angular/core';
import { JobsList } from './jobs-list';
import { JobService } from './services/job-service';
import { Job } from './model/jobs-list.model';

//Create a Job mock
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'Build and maintain UI features',
    created_at: '2025-08-10',
    page: {
      name: 'Tech Corp',
    },
    location: {
      country: { id: 'c1', name: 'USA' },
      city: { id: 'ct1', name: 'New York' },
    },
  },
  {
    id: '2',
    title: 'Backend Engineer',
    description: 'Design and build scalable APIs',
    created_at: '2025-08-09',
    page: {
      name: 'Innovate Ltd',
    },
    location: {
      country: { id: 'c2', name: 'Canada' },
      city: { id: 'ct2', name: 'Toronto' },
    },
  },
];

//Mock service
class MockJobService {
  jobs: WritableSignal<Job[]> = signal<Job[]>([]);
  loading = signal(false);

  fetchJobs() {
    this.jobs.set(mockJobs);
  }
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render jobs when service returns data', () => {
    // Arrange
    jobService.fetchJobs();
    fixture.detectChanges();

    // Act
    const host: HTMLElement = fixture.nativeElement;
    const jobCards = host.querySelectorAll('.job-card');

    // Assert
    expect(jobCards.length).toBe(mockJobs.length);
    expect(jobCards[0].textContent).toContain(mockJobs[0].title);
    expect(jobCards[1].textContent).toContain(mockJobs[1].title);
  });
});
