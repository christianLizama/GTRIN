import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sociedadSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    fechaCreacion: {type: Date, default:Date.now,required: [true, 'Fecha obligatorio']},
    ruta:{type: String, required: [true,'Ruta obligatoria']},
    descripcion:{type: String},
    carpetas:{type: [Schema.ObjectId], ref: 'Carpeta'}
});

const Sociedad = mongoose.model('Sociedad', sociedadSchema);

export default Sociedad;