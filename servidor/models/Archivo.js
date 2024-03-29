import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const archivoSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    archivo: {type: String, required: [true, 'Archivo obligatorio']},
    diasAviso: {type: Number,required: [true,'Numero de dias de aviso obligatorio']},
    peso: {type: String, required :[true, 'Peso obligatorio']},
    fechaCreacion: {type: Date,default:Date.now, required: [true, 'Fecha obligatoria']},
    fechaEmision: {type: Date, required: [true, 'Fecha Emision obligatoria']},
    fechaCaducidad:{type: Date, required: [true, 'Fecha caducidad obligatoria']},
    padre: { type: Schema.ObjectId, ref: 'SubCarpeta' ,required: [true, 'padre obligatorio']},
    abuelo: { type: Schema.ObjectId, ref: 'Carpeta' ,required: [true, 'carpeta padre obligatoria']},
    padreSuperior: { type: Schema.ObjectId, ref: 'Sociedad' ,required: [true, 'padre obligatorio']},
    descripcion:{type: String},
});

const archivo = mongoose.model('Archivo', archivoSchema);

export default archivo;