//const util = require("util");
import util from 'util';
import multer from 'multer';
import path from 'path';

// const multer = require("multer");
const maxSize = 5 * 1024 * 1024;
// const fs = require("fs");
// const directoryPath = __basedir + "/uploads/";
// const path = require("path");y

let storage = multer.memoryStorage({
  // destination: (req, file, cb) => {
  //   if (!fs.existsSync(directoryPath)) {
  //     fs.mkdirSync(directoryPath);
  //   }
  //   cb(null, directoryPath);
  // },
  // filename: (req, file, cb) => {
  //   cb(
  //     null, file.originalname.split(".")[0] + "-" + Date.now() + path.extname(file.originalname)
  //   );
  // },
});



let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  filename: function (req, file, cb) {
    const fecha = Date.now()
    const extname = path.extname(file.originalname);
    const filename = path.basename(file.originalname, extname);
    cb(null, `${filename}-${fecha}${extname}`);
  }
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

export default {
  uploadFileMiddleware
}
