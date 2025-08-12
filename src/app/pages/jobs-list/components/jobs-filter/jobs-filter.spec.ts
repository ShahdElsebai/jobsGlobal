import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { JobsFilter } from './jobs-filter';

describe('JobsFilter', () => {
  let fixture: ComponentFixture<JobsFilter>;
  let component: JobsFilter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsFilter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits filterChanged after debounce', () => {
    const spy = jasmine.createSpy('filterChanged');
    component.filterChanged.subscribe(spy);

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));

    jasmine.clock().tick(500);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('test');
  });

  it('reflects parent value into the input', () => {
    // parent sets initial value
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();

    let input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('hello');

    // parent clears value
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();

    input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('');
  });
});
