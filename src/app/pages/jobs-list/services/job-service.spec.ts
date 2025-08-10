import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JobService } from './job-service';
import { environment } from '../../../../environments/environments';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), JobService],
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch jobs and update signals', () => {
    service.fetchJobs();

    const req = httpMock.expectOne(
      `${environment.BASE_URL}/jobs/all?pagination_type=paginate&page=1&per_page=10`
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      data: [
        {
          id: '1',
          title: 'Frontend Developer',
          description: 'Build UI',
          created_at: '2025-08-10T00:00:00Z',
          page: { name: 'Tech Corp' },
          location: {
            country: { id: 'US', name: 'USA' },
            city: { id: 'NY', name: 'New York' },
          },
        },
      ],
      links: { first: '', last: '', prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    });

    expect(service.jobs()).toHaveSize(1);
    expect(service.loading()).toBeFalse();
  });

  it('should not load more jobs if currentPage >= lastPage', () => {
    service.currentPage.set(2);
    service.lastPage.set(2);

    spyOn(service, 'loadJobs').and.callThrough();

    service.loadMore();

    expect(service.loadJobs).not.toHaveBeenCalled();
  });
});
