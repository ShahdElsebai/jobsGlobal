import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobModal } from './job-modal';
import { Job } from '../../model/jobs-list.model';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';

describe('JobModal', () => {
  let fixture: ComponentFixture<JobModal>;
  let component: JobModal;
  let toastSpy: jasmine.SpyObj<ToastService>;

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

    await TestBed.configureTestingModule({
      imports: [JobModal],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open(): shows modal, sets job, not applied by default', () => {
    component.open(jobA);
    expect(component.isOpen()).toBeTrue();
    expect(component.job()).toEqual(jobA);
    expect(component.applied()).toBeFalse();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('open(): respects appliedJobIds input (marks as applied)', () => {
    fixture.componentRef.setInput('appliedJobIds', new Set([jobA.id]));
    component.open(jobA);
    expect(component.applied()).toBeTrue();

    component.applyClicked();
    expect(component.applyJob()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('applyClicked(): opens form when allowed', () => {
    component.open(jobA);
    component.applyClicked();
    expect(component.applyJob()).toEqual(jobA);
    expect(component.showApplicationForm()).toBeTrue();
  });

  it('applyClicked(): no-op if no job loaded', () => {
    component.applyClicked();
    expect(component.applyJob()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('onSubmitSuccess(): sets applied, hides form, emits id, shows success toast', () => {
    let emittedId: string | undefined;
    component.appliedJob.subscribe(id => (emittedId = id));

    component.open(jobA);
    component.applyClicked();
    component.onSubmitSuccess();

    expect(component.applied()).toBeTrue();
    expect(component.showApplicationForm()).toBeFalse();
    expect(emittedId).toBe(jobA.id);
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Application submitted successfully!',
      ToastTypes.Success
    );
  });

  it('cancelApplication(): hides form, keeps modal open', () => {
    component.open(jobA);
    component.applyClicked();
    component.cancelApplication();

    expect(component.showApplicationForm()).toBeFalse();
    expect(component.isOpen()).toBeTrue();
  });

  it('saveClicked(): first save stores job, adds to saved set, toasts success, and closes', () => {
    component.open(jobA);
    fixture.detectChanges();

    component.saveClicked();

    expect(component.saveJob()).toEqual(jobA);
    expect(component.isSaved()).toBeTrue();
    expect(component.savedIds().has(jobA.id)).toBeTrue();

    expect(toastSpy.show).toHaveBeenCalledWith(
      'Saved successfully!',
      ToastTypes.Success
    );
    expect(component.isOpen()).toBeFalse();
    expect(component.job()).toBeNull();
  });

  it('saveClicked(): second click on already saved job is guarded (no toast, no close)', () => {
    component.open(jobA);
    component.saveClicked();

    component.open(jobA);
    fixture.detectChanges();

    const callsBefore = toastSpy.show.calls.count();
    component.saveClicked();

    expect(component.isOpen()).toBeTrue();
    expect(toastSpy.show.calls.count()).toBe(callsBefore);
  });

  it('open(): reflects saved state in isSaved() after job was saved earlier', () => {
    component.savedIds.set(new Set([jobA.id]));
    component.open(jobA);

    expect(component.isSaved()).toBeTrue();
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

  it('applyClicked(): no-op if already applied (state-level guard)', () => {
    component.open(jobA);
    component.applied.set(true);

    component.applyClicked();
    expect(component.applyJob()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });
});
