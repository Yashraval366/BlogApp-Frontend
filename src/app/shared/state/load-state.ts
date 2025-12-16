import { catchError, delay, delayWhen, map, Observable, of, startWith, timer } from "rxjs";

export type LoadState<T> = | {status: 'loading'} 
| {status: 'success'; data: T} 
| {status: 'error'; error: any}

export function loadState<T>(obs$: Observable<T>, successDelayMs = 2000): Observable<LoadState<T>> {
    return obs$.pipe(
        map((data : any) => ({status: 'success', data: data }) as LoadState<T>),
        catchError((err: any) => of({status: 'error', error: err} as LoadState<T>)),
        startWith({status: 'loading'} as LoadState<T>),
        delayWhen((state) => state.status == 'success' ? timer(successDelayMs) : of(null))
    )
}