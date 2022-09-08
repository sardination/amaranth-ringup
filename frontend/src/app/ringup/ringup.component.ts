import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Product } from '../classes/product';

import { ProductService } from '../services/product.service'

import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

  faTimes = faTimes;

  columnsToDisplay = ['name', 'unit_price', 'quantity', 'delete'];
  tableDataSource: MatTableDataSource<RingupProduct>;

  availableProducts : Product[] = [];
  ringupProducts : RingupProduct[] = [];

  selectedNewProduct : Product = new Product(-1, "", 0, "lb");

  constructor(
    private productService: ProductService
  ) {
    this.tableDataSource = new MatTableDataSource<RingupProduct>();
    this.productService.getAllProducts()
        .subscribe(products => {
          this.availableProducts = products;
          this.availableProducts.push(new Product(-1, "Other", 0, ""));
        })
  }

  ngOnInit(): void {
  }

  displayInputProductFunction(product: Product | null) {
    if (product == null) {
      return "";
    }

    return product.name;
  }

  ringupTotal() : number {
    var total = 0;
    this.ringupProducts.forEach(function(ringupProduct) {
      total += ringupProduct.quantity * ringupProduct.product.unit_price;
    });
    return total;
  }

  addRingupProduct() : void {
    var newRingupProduct: RingupProduct = {
      product: this.selectedNewProduct,
      quantity: 0
    };

    this.ringupProducts.push(newRingupProduct);
    this.tableDataSource.data = this.ringupProducts;
  }

  deleteRingupProduct(ringupProduct: RingupProduct) : void {
    this.ringupProducts.splice(this.ringupProducts.indexOf(ringupProduct), 1);
    this.tableDataSource.data = this.ringupProducts;
  }

}
