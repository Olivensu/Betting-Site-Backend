const {Router} = require('express');
const uploadMiddleware = require('../middleware/MulterMiddleware');
const UploadModel = require('../model/UploadModel');
// const UploadModel = require('../model/UploadModel');

const router = Router();

router.get('/api/get', async(req,res)=>{
    const allPhotots = await UploadModel.find().sort({createdAt: "descending"});
    res.send(allPhotots)
});

router.post("/api/save", uploadMiddleware.single("photo"), async (req, res)=>{
    const photo = req.file.filename;
    console.log(photo);
    await UploadModel.create({photo})
    .then((data)=>{
        console.log("Uploaded successfully...");
        console.log(data);
        res.send(data);
    }).catch((err)=>{
        console.log(err)
    })
});

module.exports = router;