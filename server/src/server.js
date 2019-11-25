const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const transactionsApi = require('./routes/transactions');

const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.origins("http://localhost:3000");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/transactions', transactionsApi);

const mongo_hostname = (process.env.MONGO_HOSTNAME || 'localhost');
const mongo_port = (process.env.MONGO_PORT || 27017);

console.log('test ');

mongoose.connect(`mongodb://${mongo_hostname}:${mongo_port}`, {dbName:'iwab', useNewUrlParser: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error:'));

db.once('open', () => {
  server.listen(9000, () => {
    console.log('Node server running on port 9000');
  });

  registerChangeStream(db, 'transactions');
});

function registerChangeStream(db, collectionName) {
    const collection = db.collection(collectionName);
    const changeStream = collection.watch({ fullDocument: 'updateLookup' });
    changeStream.on('change', (change) => {
        // console.log(change.fullDocument);
          
        if(change.operationType === 'insert') {
            const doc = change.fullDocument;
            console.log('emit insert');
            io.emit(
                `${collectionName}.inserted`,
                doc
            );
        } else if(change.operationType === 'update' || change.operationType === 'replace') {
            const doc = change.fullDocument;
            console.log('emit update/replace');
             io.emit(
                `${collectionName}.updated`,
                doc
            );
        } else if(change.operationType === 'delete') {
            console.log('emit delete');
            io.emit(
                `${collectionName}.deleted`,
                change.documentKey._id
            );
        } else {
            console.log('unhandled operationType: ' + change.operationType);
        }
      });
}

//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {
  console.log("New client connected");

  //Here we listen on a new namespace called "incoming data"
  socket.on("incoming data", (data)=>{
      //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
     socket.broadcast.emit("outgoing data", {num: data});
  });

  //A special namespace "disconnect" for when a client disconnects
  socket.on("disconnect", () => console.log("Client disconnected"));
});