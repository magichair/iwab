import 'bootstrap/dist/css/bootstrap.css';

import * as React from 'react';
import { Spinner, Alert, Table } from 'reactstrap';
import io from "socket.io-client";
import { Transaction } from '../types';

interface State {
    transactions: Transaction[],
    loading: boolean,
    error: boolean
}

export default class TransactionsList extends React.Component<{}, State> {
    constructor(props:any) {
        super(props);
        this.state = {
            transactions: [],
            loading: true,
            error: false
        }
    }

    componentDidMount() {
        const socket = io('http://localhost:9000/');
        socket.on('connect', () => console.log('connect'));
        socket.on('transactions.inserted', (data:any) => {
            console.log('transactions.inserted: ' + data);
            this.setState(prevState => ({
                transactions: prevState.transactions.concat(data)
            }));
        });
        socket.on('transactions.deleted', (data:any) => {
            console.log('transactions.deleted: ' + data);
            this.setState(prevState => ({
                transactions: prevState.transactions.filter(el => el._id !== data)
            }));
        });
        socket.on('transactions.updated', (data:any) => {
            console.log('transactions.updated: ' + data);
            //items[items.findIndex(el => el.id === item.id)] = item;
            this.setState(prevState => {
                const index = prevState.transactions.findIndex(el => el._id === data._id);
                prevState.transactions[index] = data;
                return ({
                    transactions: prevState.transactions
                });
            });
        });

        fetch('http://localhost:9000/transactions')
            .then(response => response.json())
            .then(response => this.setState({
                transactions: response,
                loading: false
            }))
            .catch(error => this.setState({
                loading: false,
                error: true
            }));
    }

    render() {

        const { transactions, loading, error } = this.state;

        const transactionsListItems = transactions.map((transaction:Transaction) => {
            return (
            <tr color="info" key={transaction._id}>
                <th>{transaction.date}</th>
                <th>{transaction.payee}</th>
                <th>{transaction.budget}</th>
                <th>{transaction.description}</th>
                <th>{transaction.inflow}</th>
                <th>{transaction.outflow}</th>
                <th>{transaction.cleared}</th>
            </tr>
            );
        })


        return (
        <div>
            {loading && <div><Spinner color="primary" /></div>}
            {!loading && !error && 
            <div>
                <Table striped bordered size="sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payee</th>
                            <th>Budget</th>
                            <th>Description</th>
                            <th>Inflow</th>
                            <th>Outflow</th>
                            <th>Cleared</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsListItems}
                    </tbody>
                </Table>
            </div>
            }
            {error && 
                <div>
                    <Alert color="danger">Error Loading Transactions</Alert>
                </div>
            }
        </div>
        );
  }
}