import axios from "axios";

class UploadFilesService {
  upload(file, onUploadProgress) {
    let formData = new FormData();
    formData.append("file", file);

    return axios.post("uploadFile/upload",formData, {headers: {"Content-Type": "multipart/form-data"},onUploadProgress});
  }
  download(file){
    return axios.get("uploadFile/files/"+ file,{
      responseType: 'blob'
    });
  }

  getFiles() {
    return axios.get("uploadFile/files");
  }
}

export default new UploadFilesService();
