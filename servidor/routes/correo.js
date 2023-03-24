const express = require('express')
const correo = require('../controllers/Correo/correoController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde correo');
});

//Para crear un cron 
router.post('/sendEmail', correo.enviarCorreo);
//Para detener un cron
router.post('/stopCron', correo.stopCron);

module.exports = router;