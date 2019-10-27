const Transaction  = require('../models/transaction');
const express = require('express');
const router = express.Router();

/* GET ALL */
router.get('/', (req, res) => {
  Transaction.find({}, (err, docs) => {
    if (err) {
      console.log('FIND Error: ' + err);
      res.status(500).send('Error');
    } else {
      res.status(200).json(docs);
    }
  })
});

/* GET ONE */
router.get('/:id', (req, res) => {
  Transaction.findById(req.params.id, (err, transaction) => {
    if (err) {
      console.log('FIND by id Error: ' + err);
      res.status(500).send('Error');
    } else if (transaction) {
      res.status(200).json(transaction);
    } else {
      res.status(404).send('Not Found');
    }
  });
});

/* UPDATE */
router.put('/:id', (req, res) => {
  const query = Transaction.findByIdAndUpdate(req.params.id, req.body, {new: true, useFindAndModify: true}, (err, transaction) => {
    if (err) {
      console.log('UPDATE by id Error: ' + err);
      res.status(500).send('Error');
    } else {
      res.status(200).json(transaction);
    }
  });
})

/* CREATE */
router.post('/', (req, res) => {
  Transaction.create(req.body, (err, transaction) => {
      if (err) {
          console.log('CREATE Error: ' + err);
          res.status(500).send('Error');
      } else {
          res.status(200).json(transaction);
      }
  });
});

router.route('/:id')
  /* DELETE */
  .delete((req, res) => {
    Transaction.findById(req.params.id, (err, transaction) => {
      if (err) { 
        console.log('DELETE Error: ' + err);
        res.status(500).send('Error');
      } else if (transaction) {
        transaction.remove( () => {
          res.status(200).json(transaction);
        });
     } else {
        res.status(404).send('Not found');
      }
    });
  });

module.exports = router;