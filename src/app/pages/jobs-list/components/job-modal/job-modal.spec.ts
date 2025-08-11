import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { Job } from '../../model/jobs-list.model';
import { JobsStore } from '../../state/jobs.store';
import { JobModal } from './job-modal';

class MockJobsStore {
  appliedJobIds = signal<Set<string>>(new Set());
  savedIds = signal<Set<string>>(new Set());

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

describe('JobModal', () => {
  let fixture: ComponentFixture<JobModal>;
  let component: JobModal;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let store: MockJobsStore;

  const jobA: Job = {
    id: '1',
    title: 'Frontend Developer',
    description: 'Create UI and components',
    created_at: '2025-08-10T00:00:00Z',
    page: { name: 'Tech Corp' },
    location: {
      country: { id: 'EG', name: 'Egypt' },
      city: { id: 'CAI', name: 'Cairo' },
    },
    type: 'full-time',
  };

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['show', 'remove']);
    store = new MockJobsStore();

    await TestBed.configureTestingModule({
      imports: [JobModal],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastSpy },
        { provide: JobsStore, useValue: store },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open(): shows modal and sets job', () => {
    component.open(jobA);
    expect(component.isOpen()).toBeTrue();
    expect(component.job()).toEqual(jobA);
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('applied() reflects store.appliedJobIds', () => {
    component.open(jobA);
    expect(component.applied()).toBeFalse();

    store.appliedJobIds.set(new Set([jobA.id]));
    fixture.detectChanges();

    expect(component.applied()).toBeTrue();
  });

  it('isSaved() reflects store.savedIds', () => {
    component.open(jobA);
    expect(component.isSaved()).toBeFalse();

    store.savedIds.set(new Set([jobA.id]));
    fixture.detectChanges();

    expect(component.isSaved()).toBeTrue();
  });

  it('applyClicked(): opens form when not applied', () => {
    component.open(jobA);
    component.applyClicked();
    expect(component.applyJob()).toEqual(jobA);
    expect(component.showApplicationForm()).toBeTrue();
  });

  it('applyClicked(): no-op when already applied', () => {
    store.appliedJobIds.set(new Set([jobA.id]));
    component.open(jobA);

    component.applyClicked();
    expect(component.applyJob()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('onSubmitSuccess(): marks applied, toasts success, hides form, and closes', () => {
    component.open(jobA);
    component.applyClicked();

    component.onSubmitSuccess();

    expect(store.markApplied).toHaveBeenCalledWith(jobA.id);
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Application submitted successfully!',
      ToastTypes.Success
    );
    expect(component.showApplicationForm()).toBeFalse();
    expect(component.isOpen()).toBeFalse();
  });

  it('cancelApplication(): hides form, keeps modal open', () => {
    component.open(jobA);
    component.applyClicked();

    component.cancelApplication();

    expect(component.showApplicationForm()).toBeFalse();
    expect(component.isOpen()).toBeTrue();
  });

  it('saveClicked(): first save marks saved, toasts success, and closes', () => {
    component.open(jobA);
    fixture.detectChanges();

    component.saveClicked();

    expect(store.markSaved).toHaveBeenCalledWith(jobA.id);
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Saved successfully!',
      ToastTypes.Success
    );
    expect(component.isOpen()).toBeFalse();
    expect(component.job()).toBeNull();
  });

  it('saveClicked(): guarded when already saved (no toast, no close)', () => {
    store.savedIds.set(new Set([jobA.id]));
    component.open(jobA);
    fixture.detectChanges();

    const before = toastSpy.show.calls.count();
    component.saveClicked();

    expect(component.isOpen()).toBeTrue();
    expect(toastSpy.show.calls.count()).toBe(before);
  });

  it('close(): hides and clears job and form', () => {
    component.open(jobA);
    component.applyClicked();

    component.close();

    expect(component.isOpen()).toBeFalse();
    expect(component.job()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('renders job title & company when open (DOM check)', () => {
    component.open(jobA);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(jobA.title);
    expect(el.textContent).toContain(jobA.page.name);
  });
});
