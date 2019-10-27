import 'bootstrap/dist/css/bootstrap.css';

import * as React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import io from "socket.io-client";

interface State {
    transactions: any[],
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

        const transactionsListItems = transactions.map((transaction:any) => {
            return <ListGroupItem color="info" key={transaction._id}>{transaction.description}</ListGroupItem>
        })


        return (
        <div>
            {loading && <div>Loading...</div>}
            {!loading && !error && 
                <ListGroup>{transactionsListItems}</ListGroup>
            }
            {error && <div>Error message</div>}
        </div>
        );
  }
}