const express = require('express');
const baccarat = express.Router();

baccarat.get('/baccarat', (req,res)=>{
    res.send('Hello baccarat')
})

// make countdown for baraccat



module.exports = baccarat;