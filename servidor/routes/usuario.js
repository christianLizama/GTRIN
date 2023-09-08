import express from "express";
import usuario from "../controllers/Usuario/usuarioController.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Respondiendo desde usuario");
});

//Usuarios
router.get("/getUsuariosNormales", usuario.getUsuariosNormales);
router.get("/verificarTokenValido", usuario.verificarToken);
router.get("/getUsuarios", usuario.getUsuarios);
router.get("/queryUsuario", usuario.queryUsuario);
router.get("/queryTokenID", usuario.queryTokenID);
router.post("/postUsuario", usuario.postUsuario);
router.post("/login", usuario.login);
router.put("/updateUsuario", usuario.updateUsuario);
router.post("/removeUsuario", usuario.removeUsuario);
//Recuperacion
router.post("/recuperarContrasena", usuario.recuperarContrasena);
router.post("/compararCodigo", usuario.compararCodigo);
router.post("/cambiarContrasena", usuario.cambiarContrasena);

export default router;

