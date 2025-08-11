import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ApplicationForm } from './application-form';
import { ToastService } from '../../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../../shared/component/toast/model/toast.model';
import { Job } from '../../model/jobs-list.model';

describe('ApplicationForm', () => {
  let fixture: ComponentFixture<ApplicationForm>;
  let component: ApplicationForm;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const validJob: Job = {
    id: 'job-123',
    title: 'Frontend Dev',
    description: 'Build UIs',
    created_at: new Date().toISOString(),
    page: { name: 'Acme' },
    location: {
      country: { id: 'EG', name: 'Egypt' },
      city: { id: 'CAI', name: 'Cairo' },
    },
    type: 'full-time',
  };

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['show', 'remove']);

    await TestBed.configureTestingModule({
      imports: [ApplicationForm],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  function fillValidForm() {
    component.form.controls.name.setValue('Jane Doe');
    component.form.controls.email.setValue('jane@example.com');
    component.form.controls.phone.setValue('0123456789');
    component.form.controls.country.setValue('Egypt');
    component.form.controls.education.setValue('B.Sc.');
    component.form.controls.position.setValue('Engineer');
    component.form.controls.company.setValue('Acme');
    component.form.controls.coverLetter.setValue('Hello!');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toast error on invalid submit', () => {
    component.onSubmit();
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Please fix errors before submitting',
      ToastTypes.Error
    );
    expect(component.submitting()).toBeFalse();
  });

  it('should emit job id, toast success, and stop submitting on valid submit', () => {
    fixture.componentRef.setInput('job', validJob);
    fillValidForm();

    let receivedId: string | undefined;
    component.submitSuccess.subscribe(id => (receivedId = id));

    component.onSubmit();
    expect(component.submitting()).toBeTrue();

    jasmine.clock().tick(1500);
    fixture.detectChanges();

    expect(component.submitting()).toBeFalse();
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Application submitted successfully!',
      ToastTypes.Success
    );
    expect(receivedId).toBe(validJob.id);
  });

  it('onFileSelected: rejects >3MB and toasts error', () => {
    const big = new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'cv-big.pdf', {
      type: 'application/pdf',
    });
    component.onFileSelected({ target: { files: [big] } } as unknown as Event);

    expect(component.selectedFile).toBeNull();
    expect(component.fileError()).toBe('File size exceeds 3MB limit');
    expect(toastSpy.show).toHaveBeenCalledWith(
      'File size exceeds 3MB limit',
      ToastTypes.Error
    );
  });

  it('onFileSelected: accepts valid file and toasts info', () => {
    const ok = new File([new Uint8Array(500_000)], 'cv.pdf', {
      type: 'application/pdf',
    });
    component.onFileSelected({ target: { files: [ok] } } as unknown as Event);

    expect(component.fileError()).toBeNull();
    expect(component.selectedFile).toBe(ok);
    expect(toastSpy.show).toHaveBeenCalledWith(
      'CV attached ',
      ToastTypes.Info,
      1800
    );
  });
});
