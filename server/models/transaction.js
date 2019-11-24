const mongoose = require('mongoose');  
const Schema   = mongoose.Schema;

const transactionSchema = new Schema({ 
  date:         { type: Date },
  payee:        String,
  budget:       String,
  description:  String,
  inflow:       Number, // in cents
  outflow:      Number, // in cents
  cleared:      Boolean
});

module.exports = mongoose.model('Transaction', transactionSchema); 