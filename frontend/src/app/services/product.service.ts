import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Product } from '../classes/product';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private queryURL = `${environment.apiBase}/product`;

  constructor(private http: HttpClient) { }

  getAllProducts() : Observable<Product[]> {
    return this.http.get<Product[]>(
      this.queryURL,
    ).pipe(
      map(products => {
        // Convert price from cents to dollars
        products.forEach(product => {
          product.unit_price /= 100;
        })
        return products;
      }),
      catchError(error => {
        console.log(error)
        return of([])
      })
    );
  }

  getProductById(id: number) : Observable<Product | null> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", id);

    return this.http.get<Product>(
      this.queryURL,
      {params: body}
    ).pipe(
      map(product => {
        // Convert price from cents to dollars
        product.unit_price /= 100;
        return product;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  createProduct(product: Product) : Observable<Product | null> {
    // Convert price from dollars to cents
    product.unit_price *= 100;
    return this.http.post<Product>(
      this.queryURL,
      product
    ).pipe(
      map(product => {
        // Convert price from cents to dollars
        product.unit_price /= 100;
        return product;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  updateProduct(product: Product) : Observable<Product | null> {
    // Convert price from dollars to cents
    product.unit_price *= 100;
    return this.http.put<Product>(
      this.queryURL,
      product
    ).pipe(
      map(product => {
        // Convert price from cents to dollars
        product.unit_price /= 100;
        return product;
      }),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  deleteProduct(product: Product): Observable<boolean> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", product.id);

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
