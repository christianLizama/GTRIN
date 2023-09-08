import express from "express";
import logger from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import correoController from "./controllers/Correo/correoController.js";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//global.__basedir = __dirname;
global.triggers = []

mongoose.set("strictQuery", false);
dotenv.config();

//Conexion DB Local
//const uri = 'mongodb://mongo/myapp';
const uri = process.env.MONGO_URL
//Conexion DB nueva
// console.log(uri)
const options = {useNewUrlParser: true};
mongoose.connect(uri, options).then((client) => { 
    console.log('Conectado a DB')
    correoController.cargarTriggers();
  },
  err => { console.log(err) }
);

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
// const sRouter = require("./routes/sociedad");
// const carpetaRouter = require("./routes/carpeta");
// const subCarpetaRouter = require("./routes/subCarpeta");
// const archivosRouter = require("./routes/archivo");
// const uploadFileRouter = require("./routes/uploadFile");
// const correoRouter = require("./routes/correo");
// const usuarioRouter = require("./routes/usuario");
// const eliminadoRouter = require("./routes/eliminado");
// Importando módulos usando `import`
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import sRouter from "./routes/sociedad.js";
import carpetaRouter from "./routes/carpeta.js";
import subCarpetaRouter from "./routes/subCarpeta.js";
import archivosRouter from "./routes/archivo.js";
import uploadFileRouter from "./routes/uploadFile.js";
import correoRouter from "./routes/correo.js";
import usuarioRouter from "./routes/usuario.js";
import eliminadoRouter from "./routes/eliminado.js";
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/sociedad", sRouter);
app.use("/carpeta",carpetaRouter);
app.use("/subCarpeta",subCarpetaRouter);
app.use("/archivo", archivosRouter);
app.use("/uploadFile", uploadFileRouter);
app.use("/correo",correoRouter);
app.use("/usuario",usuarioRouter);
app.use("/eliminado",eliminadoRouter);

//Puerto del server
const appPort = process.env.PORT_SERVER || 3030

app.listen(appPort, () => console.log(`Server esuchando en el puerto ${appPort}!`))

export default app;
