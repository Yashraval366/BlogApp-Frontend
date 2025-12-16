import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { filter, Observable, map } from "rxjs";
import { toSignal } from '@angular/core/rxjs-interop'

interface ICategory{
    Id: Number,
    Name: string,
}

@Injectable({
  providedIn: 'root'
})

export class CategoryStore
{
    private http = inject(HttpClient);

    categoryList = toSignal(
        this.http.get<any>('http://localhost:5105/api/Categories').pipe(
            map((res: any) => res.data),
        ),
        { initialValue: [] }
    );

}


