const express = require('express')
const correo = require('../controllers/Correo/correoController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde correo');
});

//Para enviar un correo
router.post('/sendEmail', correo.enviarCorreo);

module.exports = router;