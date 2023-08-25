const express = require('express')
const eliminado = require('../controllers/Eliminado/eliminadoController');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Respondiendo desde eliminado');
});

router.get('/allDeletedFiles', eliminado.getAllDeletedFiles)

module.exports = router;