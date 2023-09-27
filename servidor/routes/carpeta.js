import express from 'express';
import folder from '../controllers/Carpeta/carpetaController.js';
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde carpeta');
});

//para agregar carpetas y subcarpetas al servidor
router.post('/add', folder.add);
router.get('/query',folder.query);
router.put('/update',folder.update);
router.delete('/remove/:id', folder.remove)
router.put('/getArchivos', folder.getArchivos)
router.put('/updateHijos', folder.updateHijos)
router.get('/queryNombre', folder.queryNombre)
router.get('/querysubFolders', folder.querysubFolders)
router.delete('/deleteSubFolders/:id', folder.removeSubFolders)
router.get('/getAllFolders',folder.getAllFolders)
router.put('/addParams',folder.agregarParametros)
router.put('/updateParams',folder.actualizarParametros)
router.get('/contarCumplimiento',folder.contarCumplimiento)

export default router;