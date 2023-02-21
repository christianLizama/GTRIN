const express = require('express')
const file = require('../controllers/file.controller');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde upload File');
});

//para agregar carpetas y subcarpetas al servidor
router.post("/upload", file.upload);
router.get("/files", file.getListFiles);
router.get("/files/:name", file.download);
router.delete("/files/:name", file.remove);


module.exports = router;