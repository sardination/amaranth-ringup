export class Transaction {
    id: number;
    complete_time: Date;

    constructor(id: number, complete_time: Date) {
        this.id = id;
        this.complete_time = complete_time;
    }
}

export interface ITransaction {
    id: number;
    complete_time: string;
}
