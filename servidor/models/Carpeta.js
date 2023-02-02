import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// const parametros = new Schema({
//     value: {type: String, required: [true]},
// });

const carpetaSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    fechaCreacion: {type: Date, default:Date.now,required: [true, 'Fecha obligatorio']},
    descripcion:{type: String},
    // parametros:{type: [parametros]},
    padre: { type: Schema.ObjectId, ref: 'Sociedad' ,required: [true, 'padre obligatorio']},
    hijos: {type: [Schema.ObjectId], ref:'subCarpeta'}
});

const Carpeta = mongoose.model('Carpeta', carpetaSchema);

export default Carpeta;