import uploadFileMiddleware  from "../middleware/upload.js";
import fs from 'fs';
import {format} from 'util';
// const { format } = require("util");
// const { Storage } = require("@google-cloud/storage");
import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage({
  keyFilename: "cool-kit-375714-32d9f4710e16.json",
});
const bucket = storage.bucket("prueba-2");

const upload = async (req, res) => {
  try {
    await uploadFileMiddleware.uploadFileMiddleware(req, res);

    if (req.file==undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const fecha = Date.now()
    const extname = path.extname(req.file.originalname);
    const filename = path.basename(req.file.originalname, extname);

    req.file.originalname = `${filename}-${fecha}${extname}`;
    const blob = bucket.file(req.file.originalname);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.log(err)
      res.status(500).send({ message: "Error al subir el archivo" });
    });

    blobStream.on("finish", async (data) => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        await bucket.file(req.file.originalname).makePublic();
      } catch {
        return res.status(500).send({
          message:
            `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
          url: publicUrl,
        });
      }

      console.log("Uploaded the file successfully: " + req.file.originalname)
      res.status(200).send({
        message: req.file.originalname,
        url: publicUrl,
      });
    });

    blobStream.end(req.file.buffer);    

  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "El archivo no puede pesar más de 5mb",
      });
    }

    res.status(500).send({
      
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: "http://localhost:3030/uploadfile/files/" + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = async (req, res) => {
  try {
    const [metaData] = await bucket.file(req.params.name).getMetadata();
    res.redirect(metaData.mediaLink);
    
  } catch (err) {
    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
};

const remove = async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

const showPdf = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";
  const path = directoryPath+fileName
  if (fs.existsSync(path)) {
    res.contentType("application/pdf");
    fs.createReadStream(path).pipe(res);
  } else {
    res.status(500);
    res.send("Archivo no encontrado");
  }
};

export default {
  upload,
  getListFiles,
  download,
  remove,
  removeSync,
  showPdf,
};
