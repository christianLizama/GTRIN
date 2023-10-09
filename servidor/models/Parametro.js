import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import paginate from 'mongoose-paginate-v2';

const parametrosSchema = new Schema({
    value: {type: String, required: [true], unique: true},
    option: {type: Boolean, required:[true]},
    usuariosConAcceso: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }]    
});

parametrosSchema.plugin(paginate);

const Parametro = mongoose.model('Parametro',parametrosSchema);
Parametro.paginate().then({});

export default Parametro;