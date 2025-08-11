import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobsList } from './jobs-list';
import { Job } from './model/jobs-list.model';
import { signal, WritableSignal } from '@angular/core';
import { JobsStore } from './state/jobs.store';

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
    type: 'full-time',
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
    type: 'full-time',
  },
];

class MockJobsStore {
  // core state
  jobs: WritableSignal<Job[]> = signal(mockJobs);
  loading = signal(false);
  currentPage = signal(1);
  lastPage = signal(2);
  filter = signal('');
  error = signal<string | null>(null);

  // derived selectors (signals for simplicity in the mock)
  filteredJobs = signal<Job[]>(mockJobs);
  initialLoading = signal(false);
  loadMoreDisabled = signal(false);

  appliedJobIds = signal<Set<string>>(new Set());
  savedIds = signal<Set<string>>(new Set());

  private computeFiltered(): Job[] {
    const k = this.filter().toLowerCase().trim();
    if (!k) return this.jobs();
    return this.jobs().filter(j => {
      const title = j.title.toLowerCase();
      const loc =
        `${j.location?.city?.name ?? ''} ${j.location?.country?.name ?? ''}`.toLowerCase();
      return title.includes(k) || loc.includes(k);
    });
  }

  fetchJobs = jasmine.createSpy('fetchJobs').and.callFake(() => {
    this.error.set(null);
    this.jobs.set(mockJobs);
    this.loading.set(false);
    this.filteredJobs.set(this.computeFiltered());
  });

  loadMore = jasmine.createSpy('loadMore').and.callFake(() => {
    const next = this.currentPage() + 1;
    this.currentPage.set(next);
    this.jobs.update(list => [...list]); // noop append for test
    this.filteredJobs.set(this.computeFiltered());
  });

  setFilter = jasmine.createSpy('setFilter').and.callFake((v: string) => {
    this.filter.set(v);
    this.filteredJobs.set(this.computeFiltered());
  });

  markApplied = jasmine.createSpy('markApplied').and.callFake((id: string) => {
    const next = new Set(this.appliedJobIds());
    next.add(id);
    this.appliedJobIds.set(next);
  });

  markSaved = jasmine.createSpy('markSaved').and.callFake((id: string) => {
    const next = new Set(this.savedIds());
    next.add(id);
    this.savedIds.set(next);
  });
}

describe('JobsList', () => {
  let fixture: ComponentFixture<JobsList>;
  let component: JobsList;
  let store: MockJobsStore;

  beforeEach(async () => {
    store = new MockJobsStore();

    await TestBed.configureTestingModule({
      imports: [JobsList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: JobsStore, useValue: store },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create & call store.fetchJobs in constructor', () => {
    expect(component).toBeTruthy();
    expect(store.fetchJobs).toHaveBeenCalled();
  });

  it('should expose filtered jobs from the store', () => {
    expect(component.filteredJobs().length).toBe(mockJobs.length);
  });

  it('should filter by title (case-insensitive)', () => {
    component.onFilterChange('backend');
    fixture.detectChanges();

    const f = component.filteredJobs();
    expect(store.setFilter).toHaveBeenCalledWith('backend');
    expect(f.length).toBe(1);
    expect(f[0].title.toLowerCase()).toContain('backend');
  });

  it('should filter by location (city or country)', () => {
    component.onFilterChange('toronto');
    fixture.detectChanges();

    const f = component.filteredJobs();
    expect(f.length).toBe(1);
    expect(f[0].location?.city?.name?.toLowerCase()).toBe('toronto');
  });

  it('onLoadMore proxies to store.loadMore', () => {
    component.onLoadMore();
    expect(store.loadMore).toHaveBeenCalled();
  });

  it('initialLoading and loadMoreDisabled reflect store signals', () => {
    store.initialLoading.set(true);
    expect(component.initialLoading()).toBeTrue();

    store.initialLoading.set(false);
    expect(component.initialLoading()).toBeFalse();

    store.loadMoreDisabled.set(true);
    expect(component.loadMoreDisabled()).toBeTrue();

    store.loadMoreDisabled.set(false);
    expect(component.loadMoreDisabled()).toBeFalse();
  });

  it('shows error banner and Retry calls store.fetchJobs', () => {
    // simulate an error state
    store.error.set('Failed to load jobs. Please try again.');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Failed to load jobs');

    const retryBtn: HTMLButtonElement | null = host.querySelector('button');
    expect(retryBtn).toBeTruthy();

    retryBtn!.click();
    expect(store.fetchJobs).toHaveBeenCalledTimes(2); // constructor + retry
  });

  it('openModalWithJob sets selectedJob and calls modal.open', () => {
    spyOn(component.jobModal, 'open');
    const job = mockJobs[0];

    component.openModalWithJob(job);

    expect(component.selectedJob()).toEqual(job);
    expect(component.jobModal.open).toHaveBeenCalledWith(job);
  });

  it('closeModal calls modal.close', () => {
    spyOn(component.jobModal, 'close');
    component.closeModal();
    expect(component.jobModal.close).toHaveBeenCalled();
  });

  it('onApplied updates store.markApplied and applied set', () => {
    expect(store.appliedJobIds().has('1')).toBeFalse();

    component.onApplied('1');
    expect(store.markApplied).toHaveBeenCalledWith('1');
    expect(store.appliedJobIds().has('1')).toBeTrue();

    const before = store.appliedJobIds().size;
    component.onApplied('1'); // duplicate should not increase
    expect(store.appliedJobIds().size).toBe(before);
  });
});
