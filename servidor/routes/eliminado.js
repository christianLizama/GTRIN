import express from 'express';
import eliminado from '../controllers/Eliminado/eliminadoController.js';
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde eliminado');
});

router.get('/allDeletedFiles', eliminado.getAllDeletedFiles)

export default router;