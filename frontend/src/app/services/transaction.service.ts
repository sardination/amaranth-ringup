import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ITransaction, Transaction } from '../classes/transaction';

import { environment } from '../../environments/environment';
import Utils from '../utils';

interface TransactonAggregate {
  complete_time: Date,
  product_name: string,
  quantity: number,
  unit: string,
  unit_price: number
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private queryURL = `${environment.apiBase}/transaction`;

  constructor(private http: HttpClient) { }

  private createITransactionFromTransaction(transaction: Transaction): ITransaction {
    return {
      id: transaction.id,
      complete_time: Utils.getUTCDateTimeStringFromDate(transaction.complete_time),
    }
  }

  private createTransactionFromITransaction(itransaction: ITransaction): Transaction {
    return new Transaction(
      itransaction.id,
      Utils.convertDateTimeStringToUTCDate(itransaction.complete_time),
    )
  }

  getAllTransactions() : Observable<Transaction[]> {
    return this.http.get<ITransaction[]>(
      this.queryURL,
    ).pipe(
      map(itransactions => itransactions.map(
          itransaction => this.createTransactionFromITransaction(itransaction)
        )
      ),
      catchError(error => {
        console.log(error)
        return of([])
      })
    );
  }

  getAggregatesInTimeRange(time_range_start?: Date, time_range_end?: Date): Observable<TransactonAggregate[]> {
      var body: HttpParams = new HttpParams();

      if (time_range_start != undefined) {
        body = body.set("time_range_start", Utils.getUTCDateTimeStringFromDate(time_range_start));
      }

      if (time_range_end != undefined) {
        body = body.set("time_range_end", Utils.getUTCDateTimeStringFromDate(time_range_end));
      }

      body = body.set("aggregate", true);

      return this.http.get<TransactonAggregate[]>(
        this.queryURL,
        {params: body}
      ).pipe(
        map(transaction_aggregates => {
          // Convert price from cents to dollars
          transaction_aggregates.forEach(transaction_aggregate => {
            transaction_aggregate.unit_price /= 100;
          })
          return transaction_aggregates;
        }),
        catchError(error => {
          console.log(error)
          return of([])
        })
      );
  }

  getTransactionsInTimeRange(time_range_start?: Date, time_range_end?: Date): Observable<Transaction[]> {
    var body: HttpParams = new HttpParams();

    if (time_range_start != undefined) {
      body = body.set("time_range_start", Utils.getUTCDateTimeStringFromDate(time_range_start));
    }

    if (time_range_end != undefined) {
      body = body.set("time_range_end", Utils.getUTCDateTimeStringFromDate(time_range_end));
    }

    return this.http.get<ITransaction[]>(
      this.queryURL,
      {params: body}
    ).pipe(
      map(transactions =>
        transactions.map(transaction => {
          return this.createTransactionFromITransaction(transaction);
        })
      ),
      catchError(error => {
        console.log(error)
        return of([])
      })
    );
  }

  getTransactionById(id: number) : Observable<Transaction | null> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", id);

    return this.http.get<ITransaction>(
      this.queryURL,
      {params: body}
    ).pipe(
      map(itransaction => this.createTransactionFromITransaction(itransaction)),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  createTransaction(transaction: Transaction) : Observable<Transaction | null> {
    return this.http.post<ITransaction>(
      this.queryURL,
      this.createITransactionFromTransaction(transaction)
    ).pipe(
      map(itransaction => this.createTransactionFromITransaction(itransaction)),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  updateTransaction(transaction: Transaction) : Observable<Transaction | null> {
    return this.http.put<ITransaction>(
      this.queryURL,
      this.createITransactionFromTransaction(transaction)
    ).pipe(
       map(itransaction => this.createTransactionFromITransaction(itransaction)),
      catchError(error => {
        console.log(error)
        return of(null)
      })
    );
  }

  deleteTransaction(transaction: Transaction): Observable<boolean> {
    var body: HttpParams = new HttpParams();
    body = body.set("id", transaction.id);

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
