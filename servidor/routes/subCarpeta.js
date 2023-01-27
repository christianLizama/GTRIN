const express = require('express')
const subCarpeta = require('../controllers/SubCarpeta/subCarpetaController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde sub Carpeta');
});


router.post('/add', subCarpeta.add);
router.get('/query',subCarpeta.query);
router.put('/update',subCarpeta.update);
router.delete('/remove/:id', subCarpeta.remove)
router.get('/getArchivos', subCarpeta.getArchivos)
router.put('/addFile', subCarpeta.addFile)
router.get('/queryNombre', subCarpeta.queryNombre)
router.put('/updateSubFolder', subCarpeta.updateHijos)
router.get('/getAllSubFolders',subCarpeta.getAllSubFolders)

module.exports = router;