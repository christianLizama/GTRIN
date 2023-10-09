import express from 'express';
import parametro from '../controllers/Parametro/parametroController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde parametro');
});

router.get('/allParametros', parametro.getParametros);
router.get('/parametro/:id', parametro.getParametro);
router.post('/addParametro', parametro.addParametro);
router.delete('/deleteParametro/:id', parametro.deleteParametro);
router.put('/updateParametro/:id', parametro.updateParametro);
router.get('/countAllFiles/', parametro.countArchivos);
router.get('/countVigentes/', parametro.countArchivosVigentes);
router.get('/countPorVencer/', parametro.countArchivosPorVencer);
router.get('/countVencidos/', parametro.countArchivosVencidos);

export default router;
