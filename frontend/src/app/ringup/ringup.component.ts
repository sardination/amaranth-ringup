import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Product } from '../classes/product';
import { ProductService } from '../services/product.service';
import { Transaction } from '../classes/transaction';
import { TransactionService } from '../services/transaction.service';
import { LineItem } from '../classes/line-item';
import { LineItemService } from '../services/line-item.service';
import Utils from '../utils';
import { faTimes, faEdit,faTrash,faCheck} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import cloneDeep from 'lodash.clonedeep';

interface RingupProduct {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-ringup',
  templateUrl: './ringup.component.html',
  styleUrls: ['./ringup.component.css']
})
export class RingupComponent implements OnInit {

  // ringupForm = new FormGroup({
  //   product : new FormControl(""),
  //   quantity :  new FormControl(),
  // });

  faTimes = faTimes;
  faEdit = faEdit;
  faCheck = faCheck;
  faTrash  = faTrash;


  columnsToDisplay = ['name', 'quantity', 'unit_price', 'subtotal', 'edit', 'delete'];
  tableDataSource: MatTableDataSource<RingupProduct>;

  availableProducts : Product[] = [];
  ringupProducts : RingupProduct[] = []; //adding product
  editingProduct : RingupProduct | null = null;  //editing in the table
  editingIndex : number = 0;

  selectedNewProduct : Product = new Product(-1, "", 0, "lb");

  productquantity : number = 0.0;

  // Autocomplete
  filteredProductOptions: Product[] = [];

  createdTransaction: Transaction | null = null;
  createdLineItems: (LineItem | null)[] = [];
  successfulLineItems: number = 0;

  constructor(
    private productService: ProductService,
    private transactionService: TransactionService,
    private lineItemService: LineItemService,
  ) {
    this.tableDataSource = new MatTableDataSource<RingupProduct>();
    this.productService.getAllProducts()
        .subscribe(products => {
          this.availableProducts = products;
          this.availableProducts.push(new Product(-1, "Other", 0, "lb"));
          this.filteredProductOptions = this.availableProducts;
        })
  }

  ngOnInit(): void {

  }

  productTypedValueChanged(e: Event) {
    if (e && e.target) {
      this.filteredProductOptions = this.availableProducts.filter(option =>
        option.name.toLowerCase().indexOf((e.target as HTMLInputElement).value.toLowerCase()) === 0
      )
    }
  }

  displayInputProductFunction(product: Product | null) {
    if (product == null) {
      return "";
    }

    return product.name;
  }

  ringupTotal() : number {
    var total = 0;
    var topThis = this;
    this.ringupProducts.forEach(function(ringupProduct) {
      total += topThis.ringupSubtotal(ringupProduct);
    });
    return total;
  }

  ringupSubtotal(ringupProduct: RingupProduct): number {
    return ringupProduct.quantity * ringupProduct.product.unit_price;
  }

  addRingupProduct() : void {
    if (!this.selectedNewProduct.name || this.selectedNewProduct.name == "") return

    var newRingupProduct: RingupProduct = {
      product: cloneDeep(this.selectedNewProduct),
      quantity: this.productquantity
    };

    this.ringupProducts.push(newRingupProduct);
    this.tableDataSource.data = this.ringupProducts;

    this.productquantity = 0;
    this.selectedNewProduct =  new Product(-1, "", 0, "lb");

    this.filteredProductOptions = this.availableProducts;
  }

  deleteRingupProduct(ringupProduct: RingupProduct) : void {
    this.ringupProducts.splice(this.ringupProducts.indexOf(ringupProduct), 1);
    this.tableDataSource.data = this.ringupProducts;
  }

  selectEditingProduct(editingProduct: RingupProduct): void {
    this.tableDataSource.data = this.ringupProducts;
    this.editingProduct = editingProduct;
    this.editingIndex =  this.ringupProducts.indexOf(editingProduct);

  }

  saveEditingProduct() {
    this.tableDataSource.data = this.ringupProducts;
    var ringupProduct = this.editingProduct;
    console.log(ringupProduct);

    if (!ringupProduct)
      return;

      this.ringupProducts[this.editingIndex] =  ringupProduct;
      this.editingProduct = null;
  }

  completeTransaction(): void {
    // Don't re-create the same transaction
    if (this.createdTransaction == null) {
      // Create transaction
      this.transactionService.createTransaction(
        new Transaction(-1, new Date())
      ).subscribe(transaction => {
        if (transaction) {
          this.ringupProducts.forEach((ringupProduct, productIndex) => {
            this.createdLineItems.push(null)
            this.lineItemService.createLineItem(
              // Create line items
              new LineItem(-1, transaction.id, ringupProduct.product.name, ringupProduct.quantity, ringupProduct.product.unit, ringupProduct.product.unit_price)
            ).subscribe(line_item => {
              if (line_item) {
                this.createdLineItems[productIndex] = line_item;
                this.successfulLineItems++;
                if (this.successfulLineItems == this.ringupProducts.length) {
                  Utils.createReceiptPdf(transaction, this.createdLineItems.map(lineItem => lineItem!));
                }
              }
            })
          })

          this.createdTransaction = transaction;
        }
      })
    } else {
      this.createdLineItems.forEach((createdLineItem, lineItemIndex) => {
        if (createdLineItem != null) {
          return;
        }
        let ringupProduct = this.ringupProducts[lineItemIndex];
        this.lineItemService.createLineItem(
          // Create line items
          new LineItem(-1, this.createdTransaction!.id, ringupProduct.product.name, ringupProduct.quantity, ringupProduct.product.unit, ringupProduct.product.unit_price)
        ).subscribe(line_item => {
          this.createdLineItems[lineItemIndex] = line_item
          if (this.successfulLineItems == this.ringupProducts.length) {
            Utils.createReceiptPdf(this.createdTransaction!, this.createdLineItems.map(lineItem => lineItem!));
          }
        })
      })
    }
  }

  reprintReceipt() : void {
    if (!this.createdTransaction) {
      return;
    }
    if (this.successfulLineItems != this.ringupProducts.length) {
      return;
    }

    Utils.createReceiptPdf(this.createdTransaction, this.createdLineItems.map(lineItem => lineItem!));
  }

  exportCsv(): void {
    if (!this.createdTransaction) {
      return;
    }
    if (this.successfulLineItems != this.ringupProducts.length) {
      return;
    }

    Utils.createReceiptCsv(this.createdTransaction, this.createdLineItems.map(lineItem => lineItem!));
  }

}
