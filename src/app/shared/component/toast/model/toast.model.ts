export interface ToastInfo {
  id: number;
  message: string;
  type: ToastTypes;
}

export enum ToastTypes {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}
