import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JobsStore } from './jobs.store';
import { environment } from '../../../../environments/environments';
import { ToastService } from '../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../shared/component/toast/model/toast.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobsStoreInstance } from './model/jobs.store.model';

describe('JobsStore', () => {
  let httpMock: HttpTestingController;
  let store: JobsStoreInstance;
  let toastSpy: jasmine.SpyObj<ToastService>;
  const endpoint = `${environment.BASE_URL}/jobs/all`;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['show', 'remove']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(JobsStore as any); // injection token
  });

  afterEach(() => {
    httpMock.verify();
  });

  function expectFetch(page: number, body: any, status = 200) {
    const req = httpMock.expectOne(r => r.url.startsWith(endpoint));
    const url = new URL(req.request.urlWithParams);
    expect(url.searchParams.get('pagination_type')).toBe('paginate');
    expect(url.searchParams.get('page')).toBe(String(page));
    expect(url.searchParams.get('per_page')).toBe(String(store.perPage()));

    if (status === 200) {
      req.flush(body);
    } else {
      req.flush(body, { status, statusText: 'Error' });
    }
  }

  it('fetchJobs: loads first page into state', () => {
    store.fetchJobs();

    expectFetch(1, {
      data: [
        {
          id: '1',
          title: 'A',
          description: 'desc',
          created_at: '2025-08-10',
          page: { name: 'X' },
          location: null,
          type: 'full-time',
        },
      ],
      meta: { last_page: 3 },
      links: {},
    });

    expect(store.jobs().length).toBe(1);
    expect(store.currentPage()).toBe(1);
    expect(store.lastPage()).toBe(3);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('loadMore: increments page and appends results', () => {
    // prime with first page
    store.fetchJobs();
    expectFetch(1, {
      data: [
        {
          id: '1',
          title: 'A',
          description: null,
          created_at: '2025-08-10',
          page: { name: 'X' },
          location: null,
          type: 'full-time',
        },
      ],
      meta: { last_page: 2 },
      links: {},
    });

    // load next
    store.loadMore();
    expectFetch(2, {
      data: [
        {
          id: '2',
          title: 'B',
          description: null,
          created_at: '2025-08-09',
          page: { name: 'Y' },
          location: null,
          type: 'full-time',
        },
      ],
      meta: { last_page: 2 },
      links: {},
    });

    const ids = store.jobs().map(j => j.id);
    expect(ids).toEqual(['1', '2']);
    expect(store.currentPage()).toBe(2);
    expect(store.loadMoreDisabled()).toBeTrue();
  });

  it('fetchJobs: sets error and toasts on failure', () => {
    store.fetchJobs();

    // cause error
    const req = httpMock.expectOne(r => r.url.startsWith(endpoint));
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('Failed to load jobs. Please try again.');
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Failed to load jobs. Please try again.',
      ToastTypes.Error
    );
  });
});
