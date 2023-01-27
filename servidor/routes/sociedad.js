const express = require('express')
const createFolder = require('../controllers/Sociedad/createFolder');
const sociedadController = require('../controllers/Sociedad/SociedadController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde sociedad');
});

//para agregar carpetas y subcarpetas al servidor
router.post('/addFolder', createFolder.addFolder);
router.post('/addsubFolder', createFolder.addsubFolder);
router.put('/renameFolder', createFolder.renameFolder)



//Para agregar las carpetas a la db
router.post('/add', sociedadController.add)
router.get('/query', sociedadController.query)
router.get('/queryNombre', sociedadController.queryNombre)
router.put('/update', sociedadController.update)
router.delete('/remove/:id', sociedadController.remove)
router.put('/updateCarpetas', sociedadController.updateCarpetas)
router.put('/getArchivos', sociedadController.getArchivos)
router.get('/getPadres',sociedadController.getPadres)
router.get('/queryFolders', sociedadController.queryFolders)


module.exports = router;