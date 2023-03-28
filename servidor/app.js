import express from "express";
import logger from "morgan";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

global.__basedir = __dirname;
global.triggers = {}

mongoose.set("strictQuery", false);
require("dotenv").config();

//Conexion DB Local
//const uri = 'mongodb://mongo/myapp';
const uri = process.env.MONGO_URL
//Conexion DB nueva
// console.log(uri)
const options = {useNewUrlParser: true};
mongoose.connect(uri, options).then(() => { 
    console.log('Conectado a DB') 
  },
  err => { console.log(err) }
);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const sRouter = require("./routes/sociedad");
const carpetaRouter = require("./routes/carpeta");
const subCarpetaRouter = require("./routes/subCarpeta");
const archivosRouter = require("./routes/archivo");
const uploadFileRouter = require("./routes/uploadFile");
const correoRouter = require("./routes/correo");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/sociedad", sRouter);
app.use("/carpeta",carpetaRouter);
app.use("/subCarpeta",subCarpetaRouter);
app.use("/archivo", archivosRouter);
app.use("/uploadFile", uploadFileRouter);
app.use("/correo",correoRouter);
//Puerto del server
const appPort = process.env.PORT_SERVER || 3030

app.listen(appPort, () => console.log(`Server esuchando en el puerto ${appPort}!`))

module.exports = app;
