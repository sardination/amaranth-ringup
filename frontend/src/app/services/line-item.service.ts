import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { LineItem } from '../classes/line-item';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LineItemService {

  private queryURL = `${environment.apiBase}/line_item`;

  constructor(private http: HttpClient) { }

  getAllLineItems() : Observable<LineItem[]> {
    return this.http.get<LineItem[]>(
      this.queryURL,
    ).pipe(
      map(line_items => {
        // Convert price from cents to dollars
        line_items.forEach(line_item => {
          line_item.unit_price /= 100;
        })
        return line_items;
      }),
      catchError(error => {
        console.log(error)
        return of([])
      })
    );
  }

  getLineItemsByTransactionId(transaction_id: number) : Observable<LineItem[] | null> {
    var body: HttpParams = new HttpParams();
    body = body.set("transaction_id", transaction_id);

    return this.http.get<LineItem[]>(
      this.queryURL,
      {params: body}
    ).pipe(
      map(line_items => {
        // Convert price from cents to dollars
        line_items.forEach(line_item => {
          line_item.unit_price /= 100;
        })
        return line_items;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  getLineItemById(id: number) : Observable<LineItem | null> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", id);

    return this.http.get<LineItem>(
      this.queryURL,
      {params: body}
    ).pipe(
      map(line_item => {
        // Convert price from cents to dollars
        line_item.unit_price /= 100;
        return line_item;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  createLineItem(line_item: LineItem) : Observable<LineItem | null> {
    // Convert price from dollars to cents
    line_item.unit_price *= 100;
    return this.http.post<LineItem>(
      this.queryURL,
      line_item
    ).pipe(
      map(line_item => {
        // Convert price from cents to dollars
        line_item.unit_price /= 100;
        return line_item;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  updateLineItem(line_item: LineItem) : Observable<LineItem | null> {
    // Convert price from dollars to cents
    line_item.unit_price *= 100;
    return this.http.put<LineItem>(
      this.queryURL,
      line_item
    ).pipe(
      map(line_item => {
        // Convert price from cents to dollars
        line_item.unit_price /= 100;
        return line_item;
      }),
      catchError(error => {
        console.log(error)
        line_item.unit_price /= 100; // Revert to original price value (line_item passed by reference)
        return of(null)
      })
    );
  }

  deleteLineItem(line_item: LineItem): Observable<boolean> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", line_item.id);

    return this.http.delete(
      this.queryURL,
      {params: body}
    ).pipe(
      map(result => {
        if (result == null) {
          return false;
        }
        return true;
      },
      catchError(error => {
        console.log(error);
        return of(false);
      }))
    )
  }
}
