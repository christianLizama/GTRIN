const express = require('express')
const archivo = require('../controllers/Archivo/archivoController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde archivo');
});


//para agregar carpetas y subcarpetas al servidor
router.post('/add', archivo.add);
router.get('/query',archivo.query);
router.put('/update',archivo.update);
router.delete('/remove/:id', archivo.remove)
router.get('/getArchivos', archivo.getArchivos)
router.get('/allFiles', archivo.getAllFiles)

module.exports = router;