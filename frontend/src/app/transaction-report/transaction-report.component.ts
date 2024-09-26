import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import {
  faPlus, faMinus, faPrint, faList
} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';

import { Transaction } from '../classes/transaction';
import { TransactionService } from '../services/transaction.service';
import { LineItem } from '../classes/line-item';
import { LineItemService } from '../services/line-item.service';
import Utils from '../utils';

interface TransactionInfo {
  transaction: Transaction,
  line_items: LineItemInfo[],
  transaction_total: number
}

interface LineItemInfo {
  line_item: LineItem,
  total_cost: number
}

@Component({
  selector: 'app-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrls: ['./transaction-report.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class TransactionReportComponent implements OnInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faPrint = faPrint;
  faList = faList;

  columnsToDisplay = ['transaction_id', 'timestamp', 'transaction_total', 'reprint_receipt', 'export_csv', 'expand'];
  expandedColumnsToDisplay = ['product_name', 'quantity', 'unit_price', 'unit', 'total_cost'];

  selectedTransactions: TransactionInfo[] = [];
  expandedTransaction: TransactionInfo | null = null;

  dateRangeStart: Date = new Date();
  dateRangeEnd: Date = new Date();

  constructor(
    private transactionService: TransactionService,
    private lineItemService: LineItemService,
  ) { }

  ngOnInit(): void {
  }

  verifyAndFixDates(): void {
    // If, upon date change, the start date is after the end date,
    //     change end date to equal start date
    if (this.dateRangeStart > this.dateRangeEnd) {
      this.dateRangeEnd = this.dateRangeStart;
    }

    this.dateRangeEnd.setHours(23, 59, 59, 999)
  }

  updateTransactions(): void {
    if (this.dateRangeStart <= this.dateRangeEnd) {
      this.transactionService.getTransactionsInTimeRange(
        this.dateRangeStart,
        this.dateRangeEnd
      ).subscribe(
        transactions => {
          this.selectedTransactions = transactions.map(transaction => { return {transaction: transaction, line_items: [], transaction_total: 0} })
          this.selectedTransactions.forEach(transaction => {
            this.lineItemService.getLineItemsByTransactionId(transaction.transaction.id)
              .subscribe(lineItems => {
                let transactionLineItems: LineItemInfo[] = [];
                let transactionTotal = 0;
                if (lineItems) {
                  transactionLineItems = lineItems.map(lineItem => {return {line_item: lineItem, total_cost: lineItem.unit_price * lineItem.quantity}});
                  lineItems.forEach(lineItem => transactionTotal += lineItem.unit_price * lineItem.quantity)
                }
                transaction.line_items = transactionLineItems;
                transaction.transaction_total = transactionTotal;
              })
          })
        }
      )
    }
  }

  expandTransaction(transaction: TransactionInfo) {
    this.expandedTransaction = transaction;
  }

  collapseTransaction() {
    this.expandedTransaction = null;
  }

  reprintReceipt(transaction: TransactionInfo) {
    Utils.createReceiptPdf(transaction.transaction, transaction.line_items.map(line_item => line_item.line_item));
  }

  exportCsv(transaction: TransactionInfo) {
    Utils.createReceiptCsv(transaction.transaction, transaction.line_items.map(line_item => line_item.line_item));
  }

  exportAggregates(): void {
    let rows = [["product_name", "quantity", "unit", "unit_price", "total"]];
    this.transactionService.getAggregatesInTimeRange(this.dateRangeStart, this.dateRangeEnd)
      .subscribe(aggregates => {
        aggregates.forEach(aggregate => {
          rows.push([
            aggregate.product_name,
            `${aggregate.quantity}`,
            aggregate.unit,
            `${aggregate.unit_price}`,
            `${aggregate.quantity * aggregate.unit_price}`
          ])
        })

        Utils.createCsvFromRows(
          rows,
          `${Utils.getDateStringFromDate(this.dateRangeStart)}_to_${Utils.getDateStringFromDate(this.dateRangeEnd)}_aggregates.csv`
        );
      })
  }
}
