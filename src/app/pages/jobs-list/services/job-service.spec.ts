import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JobService } from './job-service';
import { Job, JobsApiResponse, Location, Page } from '../model/jobs-list.model';

// Helper to build Location
function mockLocation(overrides: Partial<Location> = {}): Location {
  return {
    country: { id: 'EG', name: 'Egypt' },
    city: { id: 'CAI', name: 'Cairo' },
    ...overrides,
  };
}

// Helper to build Page
function mockPage(overrides: Partial<Page> = {}): Page {
  return {
    name: 'Default Page',
    ...overrides,
  };
}

// Helper to build Job
function mockJob(overrides: Partial<Job> = {}): Job {
  return {
    id: '1',
    title: 'Default Job Title',
    description: 'Default description',
    created_at: new Date().toISOString(),
    page: mockPage(),
    location: mockLocation(),
    ...overrides,
  };
}

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        JobService,
      ],
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

  it('should have correct initial state', () => {
    expect(service.jobs()).toEqual([]);
    expect(service.loading()).toBeTrue();
  });

  it('should fetch jobs and update signal values', () => {
    const mockJobs = [
      mockJob({ id: '1', title: 'Frontend Developer' }),
      mockJob({ id: '2', title: 'Backend Developer', location: null }),
    ];

    service.fetchJobs();

    const req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );
    expect(req.request.method).toBe('GET');

    const response: JobsApiResponse = {
      data: mockJobs,
      links: { first: '', last: '', prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
      },
    };

    req.flush(response);

    expect(service.jobs()).toEqual(mockJobs);
    expect(service.loading()).toBeFalse();
  });

  it('should handle empty job list', () => {
    service.fetchJobs();

    const req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );

    req.flush({
      data: [],
      links: { first: '', last: '', prev: null, next: null },
      meta: {
        current_page: 1,
        from: 0,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 0,
        total: 0,
      },
    });

    expect(service.jobs()).toEqual([]);
    expect(service.loading()).toBeFalse();
  });

  it('should handle null description and location gracefully', () => {
    const mockJobs = [
      mockJob({
        description: null,
        location: null,
      }),
    ];

    service.fetchJobs();

    const req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );
    req.flush({
      data: mockJobs,
      links: { first: '', last: '', prev: null, next: null },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 1,
        total: 1,
      },
    });

    expect(service.jobs()).toEqual(mockJobs);
  });

  it('should override old jobs when multiple fetch calls happen', () => {
    const firstBatch = [mockJob({ id: '1', title: 'First Job' })];
    const secondBatch = [mockJob({ id: '2', title: 'Second Job' })];

    service.fetchJobs();
    let req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );
    req.flush({
      data: firstBatch,
      links: { first: '', last: '', prev: null, next: null },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 1,
        total: 1,
      },
    });

    expect(service.jobs()).toEqual(firstBatch);

    service.fetchJobs();
    req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );
    req.flush({
      data: secondBatch,
      links: { first: '', last: '', prev: null, next: null },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 1,
        total: 1,
      },
    });

    expect(service.jobs()).toEqual(secondBatch);
  });

  it('should handle HTTP errors', () => {
    service.fetchJobs();

    const req = httpMock.expectOne(
      `${service['endpoint']}/jobs/all?pagination_type=paginate&per_page=11`
    );
    req.error(new ProgressEvent('Network error'));

    expect(service.jobs()).toEqual([]);
    expect(service.loading()).toBeFalse();
  });
});
