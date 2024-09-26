export class LineItem {
    id: number;
    transaction_id: number;
    product_name: string;
    quantity: number;
    unit: string;
    unit_price: number;

    constructor(id: number, transaction_id: number, product_name: string, quantity: number,
        unit: string, unit_price: number
    ) {
        this.id = id;
        this.transaction_id = transaction_id;
        this.product_name = product_name;
        this.quantity = quantity;
        this.unit = unit;
        this.unit_price = unit_price;
    }
}
