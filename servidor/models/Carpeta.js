import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const parametrosSchema = new Schema({
    value: {type: String, required: [true]},
});

const Parametro = mongoose.model('Parametro',parametrosSchema)

const carpetaSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    fechaCreacion: {type: Date, default:Date.now,required: [true, 'Fecha obligatorio']},
    descripcion:{type: String},
    parametros:{type: [parametrosSchema]},
    padre: { type: Schema.ObjectId, ref: 'Sociedad' ,required: [true, 'padre obligatorio']},
    hijos: {type: [Schema.ObjectId], ref:'subCarpeta'}
});

const Carpeta = mongoose.model('Carpeta', carpetaSchema);

export{
    Carpeta,
    Parametro
};