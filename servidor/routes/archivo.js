import express from 'express';
import archivo from '../controllers/Archivo/archivoController.js';
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde archivo');
});


//para agregar carpetas y subcarpetas al servidor
router.post('/add', archivo.add);
router.get('/query',archivo.query);
router.put('/update',archivo.update);
router.delete('/remove/', archivo.remove)
router.get('/getArchivos', archivo.getArchivos)
router.get('/allFiles', archivo.getAllFiles)
router.get('/countFiles', archivo.countFiles)
router.delete('/removeAll/',archivo.removeAll)
router.delete('/removeFolderFiles/',archivo.removeFolderFiles)
router.get('/archivosStatus', archivo.getArchivosStatus)
router.put('/updateStatus',archivo.updateStatus)
router.get('/countAllFiles', archivo.countAll)
router.get('/countVigentes', archivo.countVigentes)
router.get('/countPorVencer', archivo.countPorVencer)
router.get('/countVencidos', archivo.countVencidos)


export default router;  