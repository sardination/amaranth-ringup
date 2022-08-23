export class Product {
    id: number;
    name: string;
    unit_price: number; // cents
    unit: string;

    constructor(id: number, name: string, unit_price: number, unit: string) {
        this.id = id;
        this.name = name;
        this.unit_price = unit_price;
        this.unit = unit;
    }
}
