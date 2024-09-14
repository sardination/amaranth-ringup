import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Product } from '../classes/product';
import { ProductService } from '../services/product.service'
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

  async createPdf() {
    const pdfDoc = await PDFDocument.create();
    const courierBoldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const titleFontSize = 20;
    const fontSize = 14;

    const titleFontY = height - 4 * titleFontSize;
    const title = 'Amaranth Acres';
    page.drawText(title, {
      x: width / 2 - courierBoldFont.widthOfTextAtSize(title, titleFontSize) / 2,
      y: titleFontY,
      size: titleFontSize,
      font: courierBoldFont,
      color: rgb(0, 0, 0),
    });

    const subtitleFontY = titleFontY - titleFontSize;
    const subtitle = `${(new Date()).toLocaleString()}`;
    page.drawText(subtitle, {
      x: width / 2 - courierFont.widthOfTextAtSize(subtitle, fontSize) / 2,
      y: subtitleFontY,
      size: fontSize,
      font: courierFont,
      color: rgb(0, 0, 0),
    });

    // Items
    this.ringupProducts.forEach((ringupProduct, i) => {
      const lineY = subtitleFontY - 40 - (i * 4) * fontSize;
      // Product name
      page.drawText(ringupProduct.product.name.toUpperCase(), {
        x: 50,
        y: lineY,
        size: fontSize,
        font: courierFont,
        color: rgb(0, 0, 0),
      });
      // Quantity and unit price
      page.drawText(`Qty ${ringupProduct.quantity} ${ringupProduct.product.unit} @ \$${ringupProduct.product.unit_price}/${ringupProduct.product.unit}`, {
        x: 70,
        y: lineY - fontSize,
        size: fontSize,
        font: courierFont,
        color: rgb(0, 0, 0)
      });
      // Subtotal
      const subtotalString = `\$${this.ringupSubtotal(ringupProduct).toFixed(2)}`;
      page.drawText(subtotalString, {
        x: width - 70 - courierFont.widthOfTextAtSize(subtotalString, fontSize),
        y: lineY,
        size: fontSize,
        font: courierFont,
        color: rgb(0, 0, 0),
      });
    })

    // Total
    const totalString = `\$${this.ringupTotal().toFixed(2)}`;
    const totalY = titleFontY - 40 - 4 * (this.ringupProducts.length + 1) * fontSize;
    page.drawText(totalString, {
      x: width - 70 - courierBoldFont.widthOfTextAtSize(totalString, fontSize),
      y: totalY,
      size: fontSize,
      font: courierBoldFont,
      color: rgb(0, 0, 0)
    });
    page.drawText('Total:', {
      x: width - 300,
      y: totalY,
      size: fontSize,
      font: courierBoldFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    var blob = new Blob([pdfBytes], {type: "application/pdf"});
    saveAs(blob, "pdf-lib_creation_example.pdf");
  }

}
