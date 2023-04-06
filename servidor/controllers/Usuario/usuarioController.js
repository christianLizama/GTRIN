import Usuario from "../../models/Usuario.js";
import Recover from "../../models/Recover.js";
import bcrypt from "bcryptjs";
import token from "../../services/token.js";
import { enviarCorreo2 } from "../Correo/correoController";

async function getUsuarios(req, res) {
  try {
    let usuarios = await Usuario.find({email:{$ne:'reportes@transportesruiz.cl'}});
    if (!usuarios) {
      res.status(404).send({
        message: "No hay ningún usuario",
      });
    } else {
      res.status(200).json(usuarios);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}
async function queryTokenID(req, res) {
  try {
    let tokenReturn = await token.decode(req.query._id);
    if (!tokenReturn) {
      res.status(404).send({
        message: "El registro no existe",
      });
    } else {
      res.status(200).json({
        id: tokenReturn._id,
        email: tokenReturn.email,
        nombreCompleto: tokenReturn.nombreCompleto,
        rol: tokenReturn.rol,
      });
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}
async function queryUsuario(req, res) {
  try {
    const reg = await Usuario.findOne({ _id: req.query._id });
    if (!reg) {
      res.status(404).send({
        message: "El registro no existe",
      });
    } else {
      res.status(200).json(reg);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}

async function postUsuario(req, res) {
  try {

    const claveHash = await bcrypt.hash(req.body.clave, 10);
    
    let usuario = new Usuario({
      rol: req.body.rol,
      nombreCompleto: req.body.nombreCompleto,
      email: req.body.email,
      clave: claveHash,
    });

    const findUser = await Usuario.findOne({ email: req.body.email });
    if (findUser) {
      res.status(200).send(false);
    } else {
      const newUser = await usuario.save();
      await enviarCorreo2(
        `Hola ${req.body.nombreCompleto},\n\n
        Se ha creado una cuenta en el sistema de Transportes Ruiz con tu usuario.\n
        Su usuario es: ${req.body.email}\n
        Su contraseña es: ${req.body.clave}`,
        `Cuenta creada exitosamente`,
        req.body.email
      );

      res.status(200).json(newUser);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
  }
}

async function updateUsuario(req, res) {
  try {
    if (req.body.option == "Si") {
      req.body.clave = await bcrypt.hash(req.body.clave, 10);
      const reg = await Usuario.findByIdAndUpdate(
        { _id: req.body._id },
        {
          nombreCompleto: req.body.nombreCompleto,
          rol: req.body.rol,
          email: req.body.email,
          clave: req.body.clave,
        }
      );
      res.status(200).json(reg);
    } else if (req.body.option == "No") {
      const reg = await Usuario.findByIdAndUpdate(
        { _id: req.body._id },
        {
          nombreCompleto: req.body.nombreCompleto,
          rol: req.body.rol,
          email: req.body.email,
          clave: req.body.clave,
        },
        { new: true }
      );
      console.log(reg);
      res.status(200).json(reg);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}

async function login(req, res, next) {
  try {
    console.log(req.body);
    let user = await Usuario.findOne({ email: req.body.email });
    if (user) {
      let match = await bcrypt.compare(req.body.password, user.clave);
      if (match) {
        console.log(user.nombreCompleto);
        let tokenReturn = await token.encode(
          user._id,
          user.rol,
          user.nombreCompleto
        );
        res.status(200).json(tokenReturn);
      } else {
        res.status(404).send({
          message: "Clave incorrecta",
        });
      }
    } else {
      res.status(404).send({
        message: "No existe un usuario con este email",
      });
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
}

async function removeUsuario(req, res, next) {
  try {
    const reg = await Usuario.findByIdAndDelete({ _id: req.body._id });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}

async function recuperarContrasena(req, res) {
  const user = await Usuario.findOne({ email: req.body.email });
  if (user) {
    const code = generateCode();
    var recover = await Recover.findOne({ email: req.body.email });
    if (!recover) {
      recover = await Recover.create({ code: code, email: req.body.email });
    } else {
      recover.code = code;
      recover.save();
    }
    await enviarCorreo2(
      `Hola ${user.nombreCompleto},\n\n
            Se ha solicitado una nueva contraseña para tu cuenta.\n\n
            Su codigo de recuperación es: ${code}\n\n`,
      `Recuperación de contraseña`,
      user.email
    );
    console.log(code);
    res.send(true);
  } else {
    res.send(false);
  }
}

async function compararCodigo(req, res) {
  let code = req.body.code;
  let recover = await Recover.findOne({ code });
  if (recover) {
    res.send(true);
    return;
  }
  res.send(false);
}

async function cambiarContrasena(req, res) {
  let code = req.body.code;
  let recover = await Recover.findOne({ code });
  if (recover) {
    let user = await Usuario.findOne({ email: recover.email });
    if (user) {
      user.clave = await bcrypt.hash(req.body.password, 10);
      user.save();
      recover.remove();
      res.send(true);
      return;
    }
  }
  res.send(false);
}

function generateCode() {
  // generate a random code with 6 letters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

export {
  getUsuarios,
  queryUsuario,
  postUsuario,
  login,
  updateUsuario,
  removeUsuario,
  queryTokenID,
  recuperarContrasena,
  compararCodigo,
  cambiarContrasena,
};
