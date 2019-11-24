export interface Transaction {
    _id: string,
    date: Date,
    payee: string,
    budget: string,
    description: string,
    inflow: number,
    outflow: number,
    cleared: boolean
}