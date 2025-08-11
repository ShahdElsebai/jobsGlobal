import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from './service/toast-service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  constructor(public toastService: ToastService) {}
}
