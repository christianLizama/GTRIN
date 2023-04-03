import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RecoverSchema = new Schema({
  email: String,
  code: String,
});

const usuario = mongoose.model("Recover", RecoverSchema);

export default usuario;
