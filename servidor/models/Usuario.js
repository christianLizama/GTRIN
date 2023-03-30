import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    rol: { type: String, maxlength: 30 },
    nombreCompleto: {type: String},
    email: { type: String, unique: true },
    clave: {type: String},
});

const usuario = mongoose.model("Usuario", UsuarioSchema);

export default usuario;