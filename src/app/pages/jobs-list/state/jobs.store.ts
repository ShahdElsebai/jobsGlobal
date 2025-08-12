import { inject, computed, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { environment } from '../../../../environments/environments';
import { Job, JobsApiResponse, JobsState } from '../model/jobs-list.model';
import { initialState } from '../config/jobs-list.config';
import { ToastService } from '../../../shared/component/toast/service/toast-service';
import { ToastTypes } from '../../../shared/component/toast/model/toast.model';
import {
  JobsStoreInstance,
  JobsStateSignals,
  StoreCtx,
} from './model/jobs.store.model';

const APPLIED_KEY: string = 'jobs.applied';
const SAVED_KEY: string = 'jobs.saved';

function readSet(key: string): Set<string> {
  try {
    const raw: string | null = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const arr: string[] = JSON.parse(raw) as string[];
    return new Set<string>(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set<string>();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    // Keep block non-empty to satisfy no-empty
    // eslint-disable-next-line no-console
    console.warn('Skipping localStorage write for key:', key, err);
  }
}

/** Typed injection token for the store */
export const JobsStore: InjectionToken<JobsStoreInstance> = signalStore(
  { providedIn: 'root' },

  withState<JobsState>(initialState),

  withComputed(
    ({ jobs, filter, loading, currentPage, lastPage }: JobsStateSignals) => ({
      filteredJobs: computed((): Job[] => {
        const k: string = filter().toLowerCase().trim();
        if (!k) return jobs();
        return jobs().filter((j: Job) => {
          const title: string = j.title.toLowerCase();
          const loc: string = `${j.location?.city?.name ?? ''} ${
            j.location?.country?.name ?? ''
          }`.toLowerCase();
          return title.includes(k) || loc.includes(k);
        });
      }),
      initialLoading: computed((): boolean => loading() && jobs().length === 0),
      loadMoreDisabled: computed(
        (): boolean => loading() || currentPage() >= lastPage()
      ),
    })
  ),

  withMethods((store: StoreCtx) => {
    const http: HttpClient = inject(HttpClient);
    const toast: ToastService = inject(ToastService);
    const endpoint: string = `${environment.BASE_URL}/jobs/all`;

    const bootApplied: Set<string> = readSet(APPLIED_KEY);
    const bootSaved: Set<string> = readSet(SAVED_KEY);
    if (bootApplied.size || bootSaved.size) {
      patchState(store, { appliedJobIds: bootApplied, savedIds: bootSaved });
    }

    const load: () => void = (): void => {
      patchState(store, { loading: true, error: null });
      const params: URLSearchParams = new URLSearchParams({
        pagination_type: 'paginate',
        page: String(store.currentPage()),
        per_page: String(store.perPage()),
      });
      const url: string = `${endpoint}?${params.toString()}`;

      http.get<JobsApiResponse>(url).subscribe({
        next: (res: JobsApiResponse): void => {
          if (store.currentPage() === 1) {
            patchState(store, { jobs: res.data ?? [] });
          } else {
            patchState(store, {
              jobs: [...store.jobs(), ...(res.data ?? [])],
            });
          }
          patchState(store, {
            lastPage: res.meta?.last_page ?? store.currentPage(),
            loading: false,
            error: null,
          });
        },
        error: (): void => {
          patchState(store, {
            loading: false,
            error: 'Failed to load jobs. Please try again.',
          });
          toast.show(
            'Failed to load jobs. Please try again.',
            ToastTypes.Error
          );
        },
      });
    };

    return {
      fetchJobs(): void {
        patchState(store, { currentPage: 1, jobs: [], error: null });
        load();
      },

      loadMore(): void {
        if (store.currentPage() < store.lastPage()) {
          patchState(store, { currentPage: store.currentPage() + 1 });
          load();
        }
      },

      setFilter(value: string): void {
        patchState(store, { filter: value });
      },

      markApplied(id: string): void {
        const next: Set<string> = new Set<string>(store.appliedJobIds());
        if (!next.has(id)) {
          next.add(id);
          patchState(store, { appliedJobIds: next });
          writeSet(APPLIED_KEY, next);
        }
      },

      markSaved(id: string): void {
        const next: Set<string> = new Set<string>(store.savedIds());
        if (!next.has(id)) {
          next.add(id);
          patchState(store, { savedIds: next });
          writeSet(SAVED_KEY, next);
        }
      },
    };
  })
) as unknown as InjectionToken<JobsStoreInstance>;
