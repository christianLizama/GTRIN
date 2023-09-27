import express from 'express';
import file from '../controllers/file.controller.js';
//const file = require('../controllers/file.controller');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde upload File');
});

router.post("/upload", file.upload);
router.get("/files", file.getListFiles);
router.get("/files/:name", file.download);
router.delete("/files/:name", file.remove);
router.get("/file/:name",file.showPdf);

export default router;