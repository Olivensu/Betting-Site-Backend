const {Router} = require('express');
const uploadMiddleware = require('../middleware/MulterMiddleware');
const UploadModel = require('../model/UploadModel');

const router = Router();

router.get('/api/get', async(req,res)=>{
    const allPhotots = await UploadModel.find().sort({createdAt: "descending"});
    res.send(allPhotots)
});

router.post("/api/save", async (req, res)=>{
    res.send("successfull")
});

module.exports = router;