import { Type } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/jobs-list/jobs-list').then(
        (m: { JobsList: Type<unknown> }) => m.JobsList
      ),
  },
];
