const fs = require('fs')
const path = require('path')

const directoryPath = path.join(__dirname, '..','uploads','TRN');
//console.log(path.resolve("..", "uploads"))
//passsing directoryPath and callback function

var arrayOfFiles = fs.readdirSync(directoryPath);
console.log(arrayOfFiles)

var archivos = []
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file);
        archivos.push(file)
    });
    console.log(archivos)

});


