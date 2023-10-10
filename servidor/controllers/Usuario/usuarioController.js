import Usuario from "../../models/Usuario.js";
import Recover from "../../models/Recover.js";
import bcrypt from "bcryptjs";
import token from "../../services/token.js";
import enviarCorreo2 from "../Correo/correoController.js";
import Sociedad from "../../models/Sociedad.js";
import carpeta from "../../models/Carpeta.js";
import Parametro from "../../models/Parametro.js";

const Carpeta = carpeta.Carpeta;

async function getUsuarios(req, res) {
  try {
    const tokenActual = req.headers.authorization.split(" ")[1];
    // Verificar si el token es válido y obtener el usuario
    const user = await token.verificarTokenValido(tokenActual);

    let usuariosQuery = {
      _id: { $ne: user._id },
      email: { $ne: "reportes@transportesruiz.cl" },
    };

    // Si el usuario es admin, ajustar la consulta para excluir administradores
    if (user.rol === "admin" && user.email !== "reportes@transportesruiz.cl") {
      usuariosQuery.rol = "usuario";
    }

    const usuarios = await Usuario.find(usuariosQuery);

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
  }
}

//Obtener usuarios normales
async function getUsuariosNormales(req, res) {
  try {
    let usuarios = await Usuario.find({ rol: "usuario" }, { clave: 0 });
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

      if (req.body.rol === "admin") {
        const sociedades = await Sociedad.find();
        const usuarioId = newUser._id;

        // Agregar el nuevo usuario a usuariosConAcceso de cada sociedad
        for (const sociedadItem of sociedades) {
          sociedadItem.usuariosConAcceso.push(usuarioId);
          await sociedadItem.save();
        }
      }

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

      // Si el usuario recupera el rol de admin, agregarlo a todas las sociedades
      if (req.body.rol === "admin") {
        // Agregar el nuevo usuario a usuariosConAcceso de cada sociedad        
        await Sociedad.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
        // Agregar el nuevo usuario a usuariosConAcceso de cada carpeta
        await Carpeta.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
        // Agregar el nuevo usuario a usuariosConAcceso de cada parámetro
        await Parametro.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
      }

      // Si el usuario ya no es admin, eliminarlo de usuariosConAcceso en todas las sociedades
      if (req.body.rol !== "admin") {
        await Sociedad.updateMany(
          { usuariosConAcceso: reg._id },
          { $pull: { usuariosConAcceso: reg._id } }
        );
        await Carpeta.updateMany(
          { usuariosConAcceso: reg._id },
          { $pull: { usuariosConAcceso: reg._id } }
        );

        await Parametro.updateMany(
          { usuariosConAcceso: reg._id },
          { $pull: { usuariosConAcceso: reg._id } }
        );

      }

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
      // Si el usuario recupera el rol de admin, agregarlo a todas las sociedades, carpetas y parámetros
      if (req.body.rol === "admin") {
        // Agregar el nuevo usuario a usuariosConAcceso de cada sociedad
        await Sociedad.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
        // Agregar el nuevo usuario a usuariosConAcceso de cada carpeta
        await Carpeta.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
        // Agregar el nuevo usuario a usuariosConAcceso de cada parámetro
        await Parametro.updateMany(
          {},
          { $addToSet: { usuariosConAcceso: reg._id } }
        );
      }
      
      // Si el usuario ya no es admin, eliminarlo de usuariosConAcceso en todas las sociedades, carpetas y parámetros
      if (req.body.rol !== "admin") {
        // Si el usuario ya no es admin, eliminarlo de usuariosConAcceso en todas las sociedades
        await Sociedad.updateMany(
          { usuariosConAcceso: reg._id },
          { $pull: { usuariosConAcceso: reg._id } }
        );
        // Si el usuario ya no es admin, eliminarlo de usuariosConAcceso en todas las carpetas  
        await Carpeta.updateMany(
          { usuariosConAcceso: reg._id }, 
          { $pull: { usuariosConAcceso: reg._id } }
        );
        // Si el usuario ya no es admin, eliminarlo de usuariosConAcceso en todos los parámetros
        await Parametro.updateMany(
          { usuariosConAcceso: reg._id },
          { $pull: { usuariosConAcceso: reg._id } }
        );    
      }
      
      //console.log(reg);
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
    let user = await Usuario.findOne({ email: req.body.email });
    console.log(user);
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
    const userId = req.body._id;

    // Eliminar al usuario de las sociedades
    await Sociedad.updateMany(
      { usuariosConAcceso: userId },
      { $pull: { usuariosConAcceso: userId } }
    );

    // Eliminar al usuario de las carpetas
    await Carpeta.updateMany(
      { usuariosConAcceso: userId },
      { $pull: { usuariosConAcceso: userId } }
    );

    // Eliminar al usuario
    const reg = await Usuario.findByIdAndDelete(userId);
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
    });
    next(e);
  }
}

async function verificarToken(req, res, next) {
  try {
    const tokenActual = req.headers.authorization.split(" ")[1];
    if (!tokenActual) {
      return res.status(404).send({
        message: "No token",
      });
    }
    try {
      const usuario = await token.verificarTokenValido(tokenActual);
      res.status(200).json("Autorizado");
    } catch (error) {
      if (error.message === "Token expirado") {
        return res.status(401).send({
          message: "Token expirado",
        });
      } else if (error.message === "Token inválido") {
        return res.status(401).send({
          message: "Token inválido",
        });
      } else if (error.message === "Usuario no encontrado") {
        return res.status(401).send({
          message: "Usuario no encontrado",
        });
      } else {
        throw error; // Si es otro tipo de error, propagar hacia arriba
      }
    }
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

export default {
  getUsuariosNormales,
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
  verificarToken,
};
