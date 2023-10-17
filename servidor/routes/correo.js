import express from 'express';
import correo from '../controllers/Correo/correoController.js';
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde correo');
});

//Para crear un cron 
router.post('/sendEmail', correo.enviarCorreo);
//Para detener un cron
router.post('/stopCron', correo.stopCron);
router.get('/getTriggers', correo.obtenerTriggers);
router.post('/sendFiles',correo.enviarArchivos);


export default router;