import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobModal } from './job-modal';
import { Job } from '../../model/jobs-list.model';

describe('JobModal', () => {
  let fixture: ComponentFixture<JobModal>;
  let component: JobModal;

  const mockJob: Job = {
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
    await TestBed.configureTestingModule({
      imports: [JobModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open() should set job, open modal, reset flags', () => {
    component.open(mockJob);

    expect(component.isOpen()).toBeTrue();
    expect(component.job()).toEqual(mockJob);
    expect(component.applied()).toBeFalse();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('close() should hide modal and clear job', () => {
    component.open(mockJob);
    component.close();

    expect(component.isOpen()).toBeFalse();
    expect(component.job()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('applyClicked() should show form when not applied and job exists', () => {
    component.open(mockJob);
    component.applyClicked();

    expect(component.applyJob()).toEqual(mockJob);
    expect(component.showApplicationForm()).toBeTrue();
  });

  it('applyClicked() should do nothing if already applied', () => {
    component.open(mockJob);
    component.applied.set(true);

    component.applyClicked();

    expect(component.applyJob()).toBeNull();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('onSubmitSuccess() should mark applied and hide form', () => {
    component.open(mockJob);
    component.applyClicked(); // show form first
    component.onSubmitSuccess();

    expect(component.applied()).toBeTrue();
    expect(component.showApplicationForm()).toBeFalse();
  });

  it('cancelApplication() should hide form only', () => {
    component.open(mockJob);
    component.applyClicked();
    component.cancelApplication();

    expect(component.showApplicationForm()).toBeFalse();
    expect(component.isOpen()).toBeTrue();
  });

  it('saveClicked() should store the current job when present', () => {
    component.open(mockJob);
    component.saveClicked();

    expect(component.saveJob()).toEqual(mockJob);
  });

  it('should render job title in the DOM when open', () => {
    component.open(mockJob);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(mockJob.title);
    expect(el.textContent).toContain(mockJob.page.name);
  });
});
