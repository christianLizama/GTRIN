import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const eliminadoSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    archivo: {type: String, required: [true, 'Archivo obligatorio']},
    diasAviso: {type: Number,required: [true,'Numero de dias de aviso obligatorio']},
    peso: {type: String, required :[true, 'Peso obligatorio']},
    fechaCreacion: {type: Date,default:Date.now, required: [true, 'Fecha obligatoria']},
    fechaEmision: {type: Date, required: [true, 'Fecha Emision obligatoria']},
    fechaCambioEstado:{type: Date, required: [true, 'Fecha de cambio estado obligatoria']},
    fechaCaducidad:{type: Date, required: [true, 'Fecha caducidad obligatoria']},
    fechaEliminacion: {type: Date,default:Date.now, required: [true, 'Fecha obligatoria']},
    padre: { type:  String, required: [true, 'padre obligatorio']},
    abuelo: { type: String, required: [true, 'carpeta padre obligatoria']},
    padreSuperior: { type: String, required: [true, 'padre superior obligatorio']},
    parametro: { type: Schema.ObjectId, ref: 'Parametro' ,required: [true, 'parametro obligatorio']},
    descripcion:{type: String},
    usuarioCreador: { type: String,required: [true, 'Usuario obligatorio']},
    usuarioEliminador: { type: String,required: [true, 'Usuario obligatorio']},
});

const Eliminado = mongoose.model('Eliminado',eliminadoSchema);

export default Eliminado;