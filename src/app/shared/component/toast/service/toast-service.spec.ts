import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastService } from './toast-service';
import { ToastTypes } from '../model/toast.model';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ToastService);

    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('show() adds a toast with default Info type', () => {
    service.show('Hello');
    const list = service.toasts();
    expect(list.length).toBe(1);
    expect(list[0].message).toBe('Hello');
    expect(list[0].type).toBe(ToastTypes.Info);
    expect(typeof list[0].id).toBe('number');
  });

  it('show() supports custom type', () => {
    service.show('Great', ToastTypes.Success);
    expect(service.toasts()[0].type).toBe(ToastTypes.Success);
  });

  it('remove() deletes the toast by id', () => {
    service.show('A');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(0);
  });

  it('auto-removes after duration', () => {
    service.show('Temp', ToastTypes.Info, 1000);
    expect(service.toasts().length).toBe(1);

    jasmine.clock().tick(999);
    expect(service.toasts().length).toBe(1);

    jasmine.clock().tick(1);
    expect(service.toasts().length).toBe(0);
  });

  it('keeps insertion order', () => {
    service.show('First', ToastTypes.Info, 5000);
    service.show('Second', ToastTypes.Error, 5000);
    const list = service.toasts();
    expect(list.length).toBe(2);
    expect(list[0].message).toBe('First');
    expect(list[1].message).toBe('Second');
  });

  it('increments ids between toasts', () => {
    service.show('one');
    service.show('two');
    const [a, b] = service.toasts();
    expect(b.id).toBeGreaterThan(a.id);
  });
});
