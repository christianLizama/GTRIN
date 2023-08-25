import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario";

async function checkToken(token) {
  let __id = null;
  try {
    const { _id } = jwt.decode(token);
    __id = _id;
  } catch (e) {
    return false;
  }
  const user = await Usuario.findOne({ _id: __id});
  if (user) {
    const token = jwt.sign({ _id: __id }, "clavesecretaparagenerartoken", {
      expiresIn: "1d",
    });
    return { token, rol: user.rol };
  } else {
    return false;
  }
}

export default {
  verificarTokenValido: async (token) => {
    try {
      const { _id } = jwt.verify(token, "clavesecretaparagenerartoken");
      const user = await Usuario.findOne({ _id });
      if (user) {
        return user; // Devolver el usuario si el token es válido
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado'); // Lanzar un error si el token ha expirado
      } else {
        throw new Error('Token inválido'); // Lanzar un error si el token es inválido
      }
    }
  },
  encode: async (_id, rol, nombreCompleto) => {
    const token = jwt.sign(
      { _id: _id, rol: rol ,nombreCompleto:nombreCompleto},
      "clavesecretaparagenerartoken",
      { expiresIn: "1d" }
    );
    return token;
  },
  decode: async (token) => {
    try {
      const { _id } = jwt.verify(token, "clavesecretaparagenerartoken");
      const user = await Usuario.findOne({ _id});
      if (user) {
        return user;
      } else {
        return false;
      }
    } catch (e) {
      const newToken = await checkToken(token);
      return newToken;
    }
  },
};
