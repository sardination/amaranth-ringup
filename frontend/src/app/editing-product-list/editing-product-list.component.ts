import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl } from '@angular/forms';

import {
  faEdit, faCheck, faTrash, faTimes
} from '@fortawesome/free-solid-svg-icons';

import { Product } from '../classes/product';

import { ProductService } from '../services/product.service'

@Component({
  selector: 'app-editing-product-list',
  templateUrl: './editing-product-list.component.html',
  styleUrls: ['./editing-product-list.component.css']
})
export class EditingProductListComponent implements OnInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faTrash = faTrash;
  faTimes = faTimes;

  editingProduct : Product | null = null;

  products : Product[] = [];

  tableDataSource: MatTableDataSource<Product>;
  columnsToDisplay = ['name', 'unit_price', 'unit', 'edit', 'delete'];

  constructor(
    private productService: ProductService,
    public dialog: MatDialog
  ) {
    this.tableDataSource = new MatTableDataSource<Product>();
  }

  ngOnInit(): void {
     this.productService.getAllProducts()
        .subscribe(products => {
          this.products = products;
          this.tableDataSource = new MatTableDataSource<Product>(this.products);
        })
  }

  selectEditingProduct(editingProduct: Product): void {
    this.tableDataSource.data = this.products;
    this.editingProduct = editingProduct;
  }

  addEmptyProduct(): void {
    var emptyProduct : Product = new Product(-1, "", 0, "");
    this.editingProduct = emptyProduct;
    this.tableDataSource.data = [emptyProduct].concat(this.products);
  }

  cancelEditProduct(): void {
    this.tableDataSource.data = this.products;
    this.editingProduct = null;
  }

  // TODO: need a way to verify contents and disallow submit on bad form contents
  saveEditingProduct() {
    this.tableDataSource.data = this.products;
    var product = this.editingProduct;

    console.log(product);

    if (!product)
      return;

    if (product.id < 0) {
      this.productService.createProduct(product)
          .subscribe(newProduct => {
              if (newProduct) {
                this.products.push(newProduct);
                this.editingProduct = null;
                this.tableDataSource.data = this.products;
              }
          })
    } else {
      var productIndex = this.products.indexOf(product);
      this.productService.updateProduct(product)
          .subscribe(updatedProduct => {
              if (updatedProduct) {
                this.products[productIndex] = updatedProduct;
                this.editingProduct = null;
                this.tableDataSource.data = this.products;
              }
          })
    }
  }

  openDeleteProductDialog(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDeleteProductDialog, {
      width: '250px',
      data: product
    });

    dialogRef.afterClosed().subscribe(approveDelete => {
      if (approveDelete) {
        this.deleteProduct(product);
      }
    });
  }

  deleteProduct(product: Product) {
    this.productService.deleteProduct(product)
        .subscribe(deletedProduct => {
          // have to use original entry due to addressing
          this.products.splice(this.products.indexOf(product), 1);
          if (this.editingProduct == null) {
            this.tableDataSource.data = this.products;
          } else {
            this.tableDataSource.data = [this.editingProduct].concat(this.products);
          }
          this.tableDataSource._updateChangeSubscription();
        })
  }

}

@Component({
  selector: 'confirm-delete-product-dialog',
  templateUrl: 'confirm-delete-product-dialog.html',
})
export class ConfirmDeleteProductDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteProductDialog>,
    @Inject(MAT_DIALOG_DATA) public product: Product) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
