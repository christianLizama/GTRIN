//const util = require("util");
import util from 'util';
import multer from 'multer';
import path from 'path';


const maxSize = 5 * 1024 * 1024;

let storage = multer.memoryStorage();

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
