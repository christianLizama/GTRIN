import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const triggerSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio'],unique: true},
    asunto: {type: String, required: [true, 'Asunto obligatorio']},
    expresion: {type: String,required: [true,'Expresion obligatoria']},
    contenedor: {type: String,required: [true,'Contenedor obligatorio']},
    carpeta: {type: String,required: [true,'Carpeta obligatoria']},
    status: {type: String,required: [true,'Status obligatorio']},
    destino: {type: [String],required: [true,'Destino obligatorio']},
});

const trigger = mongoose.model('Trigger', triggerSchema);

export default trigger;