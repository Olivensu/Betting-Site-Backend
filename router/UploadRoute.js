const {Router, response} = require('express');
const uploadMiddleware = require('../middleware/MulterMiddleware');
const UploadModel = require('../model/UploadModel');
const UploadInfo = require('../model/UploadInfo');
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

router.post("/saveinfo", async(req, res)=>{
    const {info} = req.body;
    if(!info){
        return res.status(400).json({message: "No found info"})
    }

    try {
        const infoSave = new UploadInfo({info});

    await infoSave.save();
    return res.status(201).json({message: "Deposit Submitted successfully"});
    } catch (error) {
        console.log(error)
    }
});

router.get("/getinfo", async(req, res)=>{
    try {
        const result  = await UploadInfo.find();
        const lastDocument = await UploadInfo.findOne({}).sort({ createdAt: -1 });

    if (lastDocument) {
      // The lastDocument contains the last document in the collection based on the specified field
      console.log('Last document:', lastDocument);
      return res.send(lastDocument);
    } else {
      console.log('No documents found.');
      return null;
    }
        // res.send(result);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;