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
  encode: async (_id, rol) => {
    const token = jwt.sign(
      { _id: _id, rol: rol },
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
