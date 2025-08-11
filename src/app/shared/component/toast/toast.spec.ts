import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Toast } from './toast';
import { ToastService } from './service/toast-service';
import { ToastTypes } from './model/toast.model';

describe('Toast', () => {
  let fixture: ComponentFixture<Toast>;
  let component: Toast;
  let service: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    service = TestBed.inject(ToastService);
    fixture.detectChanges();

    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a toast when service.show is called', () => {
    service.show('Hello world', ToastTypes.Success, 5000);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Hello world');
  });

  it('removes the toast when service.remove is called', () => {
    service.show('To be removed', ToastTypes.Info, 5000);
    fixture.detectChanges();

    const id = service.toasts()[0].id;
    service.remove(id);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain('To be removed');
  });

  it('auto-removes a toast after its duration', () => {
    service.show('Temporary', ToastTypes.Info, 1000);
    fixture.detectChanges();

    let el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Temporary');

    jasmine.clock().tick(1000);
    fixture.detectChanges();

    el = fixture.nativeElement;
    expect(el.textContent).not.toContain('Temporary');
  });

  it('supports multiple toasts and keeps insertion order', () => {
    service.show('First', ToastTypes.Info, 5000);
    service.show('Second', ToastTypes.Error, 5000);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('First');
    expect(el.textContent).toContain('Second');

    const firstId = service.toasts()[0].id;
    service.remove(firstId);
    fixture.detectChanges();

    expect(el.textContent).not.toContain('First');
    expect(el.textContent).toContain('Second');
  });
});
