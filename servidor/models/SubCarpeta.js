import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const subCarpetaSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    fechaCreacion: {type: Date, default:Date.now,required: [true, 'Fecha obligatorio']},
    descripcion:{type: String},
    padre: { type: Schema.ObjectId, ref: 'Carpeta' ,required: [true, 'padre obligatorio']},
    padreSuperior: { type: Schema.ObjectId, ref: 'Sociedad' ,required: [true, 'padre obligatorio']},
    archivos:{type: [Schema.ObjectId], ref: 'Archivo'},
    porcentaje: {type: Number, default:0},
    cumplimiento: {type: String, default:"No Cumple"},
});

const subCarpeta = mongoose.model('subCarpeta', subCarpetaSchema);

export default subCarpeta;