import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Product } from '../classes/product';
import { ProductService } from '../services/product.service'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';

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

  columnsToDisplay = ['name', 'unit_price', 'quantity', 'delete'];
  tableDataSource: MatTableDataSource<RingupProduct>;

  availableProducts : Product[] = [];
  ringupProducts : RingupProduct[] = [];

  selectedNewProduct : Product = new Product(-1, "", 0, "lb");

  productquantity : number = 0.0;
  


  constructor(
    private productService: ProductService
  ) {
    this.tableDataSource = new MatTableDataSource<RingupProduct>();
    this.productService.getAllProducts()
        .subscribe(products => {
          this.availableProducts = products;
          this.availableProducts.push(new Product(-1, "Other", 0, "lb"));
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
      quantity: this.productquantity,
    };

    this.ringupProducts.push(newRingupProduct);
    this.tableDataSource.data = this.ringupProducts;

    this.productquantity = 0;
    this.selectedNewProduct =  new Product(-1, "", 0, "lb");

  }

  deleteRingupProduct(ringupProduct: RingupProduct) : void {
    this.ringupProducts.splice(this.ringupProducts.indexOf(ringupProduct), 1);
    this.tableDataSource.data = this.ringupProducts;
  }

}