import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sociedadSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    fechaCreacion: {type: Date, default:Date.now,required: [true, 'Fecha obligatorio']},
    descripcion:{type: String},
    carpetas:{type: [Schema.ObjectId], ref: 'Carpeta'},
    porcentaje:{type: Number, default:0},
    usuariosConAcceso: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }]
});

const Sociedad = mongoose.model('Sociedad', sociedadSchema);

export default Sociedad;