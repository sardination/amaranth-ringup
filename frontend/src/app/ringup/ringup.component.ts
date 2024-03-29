import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Product } from '../classes/product';
import { ProductService } from '../services/product.service'
import { faTimes, faEdit,faTrash,faCheck} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';


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


  columnsToDisplay = ['name', 'quantity', 'unit_price', 'edit', 'delete'];
  tableDataSource: MatTableDataSource<RingupProduct>;

  availableProducts : Product[] = [];
  ringupProducts : RingupProduct[] = []; //adding product
  editingProduct : RingupProduct | null = null;  //editing in the table
  editingIndex : number = 0;

  selectedNewProduct : Product = new Product(-1, "", 0, "lb");

  productquantity : number = 0.0;
  
  // Autocomplete
  filteredProductOptions: Product[] = [];

  constructor(
    private productService: ProductService
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
    this.ringupProducts.forEach(function(ringupProduct) {
      total += ringupProduct.quantity * ringupProduct.product.unit_price;
    });
    return total;
  }

  addRingupProduct() : void {
    var newRingupProduct: RingupProduct = {
      product: {
        name: this.selectedNewProduct.name,
        unit_price: this.selectedNewProduct.unit_price, 
        unit: this.selectedNewProduct.unit
      } as Product,
      quantity: this.productquantity,
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
  }