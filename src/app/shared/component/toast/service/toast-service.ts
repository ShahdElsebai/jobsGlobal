import { Injectable, signal, WritableSignal } from '@angular/core';
import { ToastInfo, ToastTypes } from '../model/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts: WritableSignal<ToastInfo[]> = signal<ToastInfo[]>([]);

  get toasts(): WritableSignal<ToastInfo[]> {
    return this._toasts;
  }

  private nextId: number = 0;

  show(
    message: string,
    type: ToastInfo['type'] = ToastTypes.Info,
    duration: number = 3000
  ): void {
    const id: number = this.nextId++;
    const toast: ToastInfo = { id, message, type };

    this._toasts.update((toasts: ToastInfo[]) => [...toasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number): void {
    this._toasts.update((toasts: ToastInfo[]) =>
      toasts.filter((t: ToastInfo) => t.id !== id)
    );
  }
}
