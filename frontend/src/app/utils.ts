import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

import { Transaction } from './classes/transaction';
import { LineItem } from './classes/line-item';

export default class Utils {
    static convertDateTimeStringToUTCDate(dateTimeString: string): Date {
        let re = /^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<date>[0-9]{2}) (?<hour>[0-9]{2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})$/;
        let dateTimeElements = dateTimeString.match(re)?.groups;
        if (!dateTimeElements) {
          throw `Datetime string ${dateTimeString} not in a permitted format`;
        }
        return new Date(Date.UTC(
          parseInt(dateTimeElements['year']), parseInt(dateTimeElements['month']) - 1, parseInt(dateTimeElements['date']),
          parseInt(dateTimeElements['hour']), parseInt(dateTimeElements['minute']), parseInt(dateTimeElements['second'])
        ))
    }

    static getUTCDateTimeStringFromDate(date: Date): string {
        let year = date.getUTCFullYear().toString().padStart(4, '0');
        let month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        let day = date.getUTCDate().toString().padStart(2, '0');
        let hour = date.getUTCHours().toString().padStart(2, '0');
        let minute = date.getUTCMinutes().toString().padStart(2, '0');
        let second = date.getUTCSeconds().toString().padStart(2, '0');

        return`${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    static getDateStringFromDate(date: Date): string {
        let year = date.getUTCFullYear().toString().padStart(4, '0');
        let month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        let day = date.getUTCDate().toString().padStart(2, '0');

        return`${year}-${month}-${day}`;
    }

    static async createReceiptPdf(transaction: Transaction, lineItems: LineItem[]) {
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
        const subtitle = `${transaction.complete_time.toLocaleString()}`;
        page.drawText(subtitle, {
          x: width / 2 - courierFont.widthOfTextAtSize(subtitle, fontSize) / 2,
          y: subtitleFontY,
          size: fontSize,
          font: courierFont,
          color: rgb(0, 0, 0),
        });

        let transactionTotal = 0;

        // Items
        lineItems.forEach((lineItem, i) => {
          const lineY = subtitleFontY - 40 - (i * 4) * fontSize;
          // Product name
          page.drawText(lineItem.product_name.toUpperCase(), {
            x: 50,
            y: lineY,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
          });
          // Quantity and unit price
          page.drawText(`Qty ${lineItem.quantity} ${lineItem.unit} @ \$${lineItem.unit_price}/${lineItem.unit}`, {
            x: 70,
            y: lineY - fontSize,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0)
          });
          // Subtotal
          const subtotalString = `\$${(lineItem.quantity * lineItem.unit_price).toFixed(2)}`;
          page.drawText(subtotalString, {
            x: width - 70 - courierFont.widthOfTextAtSize(subtotalString, fontSize),
            y: lineY,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
          });

          transactionTotal += lineItem.quantity * lineItem.unit_price;
        })

        // Total
        const totalString = `\$${transactionTotal.toFixed(2)}`;
        const totalY = titleFontY - 40 - 4 * (lineItems.length + 1) * fontSize;
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
        saveAs(blob, `transaction_${transaction.id}_${Utils.getUTCDateTimeStringFromDate(transaction.complete_time)}_receipt.pdf`);
    }

    static createCsvFromRows(rows: string[][], filename: string): void {
      let csvContent = "";
      rows.forEach(function(rowArray) {
          let row = rowArray.join(",");
          csvContent += row + "\r\n";
      });

      var blob = new Blob([csvContent], {type: "application/csv"});
      saveAs(blob, filename);
    }

    static createReceiptCsv(transaction: Transaction, lineItems: LineItem[]): void {
      let rows = [["date", "product_name", "quantity", "unit", "unit_price", "total"]];
      lineItems.forEach(line_item => {
        rows.push([
          Utils.getDateStringFromDate(transaction.complete_time),
          line_item!.product_name,
          `${line_item!.quantity}`,
          line_item!.unit,
          `${line_item!.unit_price}`,
          `${line_item!.quantity * line_item!.unit_price}`
        ])
      })

      Utils.createCsvFromRows(rows, `transaction_${transaction.id}_${Utils.getUTCDateTimeStringFromDate(transaction.complete_time)}_receipt.csv`);
    }
}
