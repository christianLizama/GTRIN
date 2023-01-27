<template>
  <div>
    <v-toolbar dense dark>
      <v-btn @click="atras" big icon>
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text">
        {{ padre.nombre }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-text-field
        v-model="busqueda"
        label="Buscador"
        hide-details
        single-line
        filled
        prepend-inner-icon="mdi-magnify"
        class="shrink"
      ></v-text-field>
    </v-toolbar>
    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-data-table
      :headers="headers"
      :items="resultadoBusqueda"
      sort-by="nombre"
      class="elevation-1"
      v-if="!isLoading"
    >
      <template v-slot:[`item.status`]="{ item }">
        <v-chip :color="getColor(item.status, item)" dark>
          {{ getNombre(item.status) }}
        </v-chip>
      </template>

      <template v-slot:[`item.archivo`]="{ item }">
        <div class="text-truncate" style="max-width: 140px">
          <v-icon class="mr-2"> mdi-file-pdf-box</v-icon>
          <a class="texto" :href="link + 'uploadFile/files/' + item.archivo"
            >{{ item.archivo }}
          </a>
        </div>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Archivos</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="80%">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="blue">mdi-file-document-plus-outline</v-icon>
              </v-btn>
              <vue-json-to-csv
                :json-data="archivos"
                :labels="{
                  nombre: { title: 'Nombre' },
                  status: { title: 'Status del documento' },
                  diasVigencia: { title: 'Dias de vigencia' },
                }"
                :csv-title="padre.nombre"
                :separator="';'"
              >
                <v-btn icon>
                  <v-icon color="green">mdi-microsoft-excel</v-icon></v-btn
                >
              </vue-json-to-csv>
            </template>
            
            <loading texto="Subiendo Archivo" v-if="isUpload"></loading>
            <v-stepper v-else v-model="e1">
              <v-alert v-model="aceptado" dense text type="success">
              {{ message }}
            </v-alert>
            <v-alert v-model="rechazado" dense outlined type="error">
              {{ message }}
            </v-alert>
              <v-stepper-header>
                <v-stepper-step :complete="e1 > 1" step="1">
                  Nombre archivo
                </v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 2" step="2">
                  Seleccionar Fechas
                </v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="3"> Seleccionar Día </v-stepper-step>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-card class="mb-12 mx-auto" outlined color="lighten-1">
                    <v-card-title v-if="!isUpload">
                      <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>
                    <v-container>
                      <v-row align="center" justify="center">
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre del archivo"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-file-input
                            prepend-icon="mdi-tray-arrow-up"
                            show-size
                            label="Seleccione un archivo"
                            @change="selectFile"
                          >
                            <p>hoakasjdkdjas</p>
                          </v-file-input>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card>

                  <v-btn color="primary" text @click="close"> Cancelar </v-btn>
                  <v-btn color="primary" @click="e1 = 2"> Siguiente </v-btn>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <v-card class="mb-12 mx-auto" outlined color="lighten-1">
                    <v-card-title v-if="!isUpload">
                      <span class="text-h5">Fechas </span>
                    </v-card-title>

                    <v-card-text v-if="!isUpload">
                      <v-container>
                        <v-row align="center" justify="center">
                          <v-col cols="12" sm="6" md="4">
                            <v-menu
                              v-model="menu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                              offset-y
                              min-width="auto"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="editedItem.fechaEmision"
                                  label="Fecha de emisión"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                :max="fechaMaximaEmision"
                                locale="cl"
                                v-model="editedItem.fechaEmision"
                                @input="menu = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="12" sm="6" md="4">
                            <v-menu
                              v-model="menu2"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                              offset-y
                              min-width="auto"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="editedItem.fechaCaducidad"
                                  label="Fecha de caducidad"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                :min="fechaMinimaCaducidad"
                                locale="cl"
                                v-model="editedItem.fechaCaducidad"
                                @input="menu2 = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                  </v-card>
                  <v-btn color="primary" @click="e1 = 1" text> Atras </v-btn>
                  <v-btn color="primary" @click="e1 = 3"> Siguiente </v-btn>
                </v-stepper-content>

                <v-stepper-content step="3">
                  <v-card class="mb-12 mx-auto" outlined color="lighten-1" >
                    <v-card-title>
                      Establecer día en que el archivo deja de estar vigente
                    </v-card-title>
                    <v-card-text>
                      <v-slider
                        thumb-label="always"
                        label="Día"
                        v-model="editedItem.diasAviso"
                        min="1"
                        :max="fechaEm - 1"
                      ></v-slider>
                      <p v-if="editedItem.diasAviso == 0">
                        Día en que el archivo pasa a estado por vencer: <b>Hoy</b>
                      </p>
                      <p v-else>
                        Día en que el archivo pasa a estado por vencer:
                        <b>{{ obtenerFecha(editedItem.diasAviso) }}</b>
                      </p>
                      <p>Maxima Cantidad de dias de aviso: {{ fechaEm }}</p>
                    </v-card-text>
                  </v-card>
                  <v-btn color="primary" @click="e1 = 2" text> Atras </v-btn>
                  <v-btn color="primary" @click="save"> Guardar </v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Estas seguro que deseas eliminar este archivo?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancelar</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >Aceptar</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <!-- <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon> -->

        <v-menu left top offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon> mdi-cog </v-icon>
            </v-btn>
          </template>

          <v-list nav>
            <v-list-item
              @click="deleteOrEdit(item, index)"
              link
              v-for="(opcion, index) in items"
              :key="index"
            >
              <v-list-item-title>
                <v-icon class="mr-2"> {{ opcion.icon }} </v-icon>
                {{ opcion.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize"> Reset </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import location from "moment/dist/locale/es";
moment.updateLocale("es", location);
import UploadService from "../../services/UploadFilesService";
import VueJsonToCsv from "vue-json-to-csv";
import loading from "../loading.vue";

export default {
  components: { VueJsonToCsv, loading },
  data: () => ({
    e1: 1,
    link: process.env.VUE_APP_SERVER_URL,
    seleccion: 1,
    aceptado: false,
    rechazado: false,
    busqueda: "",
    isLoading: true,
    isUpload: false,
    nombre: "",
    currentFile: undefined,
    dialog: false,
    dialogDelete: false,
    padre: {},
    menu: false,
    menu2: false,
    items: [
      { title: "Editar", icon: "mdi-pencil", metodo: "editItem" },
      { title: "Eliminar", icon: "mdi-delete" },
    ],
    headers: [
      {
        text: "Nombre",
        align: "start",
        sortable: false,
        value: "nombre",
      },
      {
        text: "Status archivo",
        align: "center",
        sortable: true,
        value: "status",
      },
      {
        text: "Fecha cambio estado",
        sortable: false,
        align: "center",
        value: "diasAviso",
      },
      {
        text: "Dias de vigencia archivo",
        align: "center",
        sortable: false,
        value: "diasVigencia",
      },
      {
        text: "Dias restantes caducidad",
        align: "center",
        sortable: true,
        value: "diasRestantes",
      },
      { text: "Archivo", sortable: false, value: "archivo" },
      { text: "Tamaño", value: "peso", align: "center" },
      { text: "Fecha Subida", value: "fechaCreacion", align: "center" },
      { text: "Fecha Emisión", value: "fechaEmision", align: "center" },
      { text: "Fecha Caducidad", value: "fechaCaducidad", align: "center" },
      { text: "Acciones", value: "actions", sortable: false, align: "center" },
    ],
    message: "",
    progress: 0,
    archivos: [],
    editedIndex: -1,
    editedItem: {
      nombre: "",
      status: "",
      diasVigencia: "",
      diasRestantes: 0,
      archivo: "",
      diasAviso: 1,
      peso: "",
      fechaEmision: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      fechaCaducidad: moment().add(1, "days").toISOString().substr(0, 10),
      padre: "",
      abuelo: "",
      padreSuperior: "",
    },
    defaultItem: {
      nombre: "",
      archivo: "",
      status: "",
      diasVigencia: "",
      diasAviso: 1,
      diasRestantes: 0,
      peso: "",
      fechaEmision: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      fechaCaducidad: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      padre: "",
      abuelo: "",
      padreSuperior: "",
    },
  }),
  computed: {
    fechaMaximaEmision() {
      this.fechasIguales();
      return moment().toISOString().substr(0, 10);
    },
    fechaMinimaCaducidad() {
      return moment(this.editedItem.fechaEmision)
        .add(1, "days")
        .toISOString()
        .substr(0, 10);
    },
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Archivo" : "Editar Archivo";
    },
    fechaEm() {
      if (this.editedItem.fechaEmision) {
        return this.obtenerDiferencia(
          this.editedItem.fechaEmision,
          this.editedItem.fechaCaducidad
        );
      } else {
        return 1;
      }
    },
    resultadoBusqueda() {
      if (this.busqueda) {
        return this.archivos.filter((item) => {
          return this.busqueda
            .toLowerCase()
            .split(" ")
            .every((v) => item.nombre.toLowerCase().includes(v));
        });
      } else {
        return this.archivos;
      }
    },
  },
  watch: {
    aceptado(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.aceptado = false;
        }, 2000);
      }
    },
    rechazado(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.rechazado = false;
        }, 1000);
      }
    },
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    fechasIguales() {
      // console.log("Fecha emision: "+this.editedItem.fechaEmision)
      // console.log("Fecha caducidad: "+this.editedItem.fechaCaducidad)
      if (
        this.obtenerDiferencia(
          this.editedItem.fechaEmision,
          this.editedItem.fechaCaducidad
        ) == 0
      ) {
        this.editedItem.fechaCaducidad = moment(this.editedItem.fechaEmision)
          .add(1, "days")
          .toISOString()
          .substr(0, 10);
      }
    },
    obtenerFecha(dias) {
      // console.log(dias)
      let fechaPosicion = moment(this.editedItem.fechaEmision)
        .add(dias, "days")
        .format("DD/MM/YYYY");
      return fechaPosicion;
    },
    deleteOrEdit(item, opcion) {
      opcion = opcion + 1;
      //Si es editar
      if (opcion == 1) {
        this.editItem(item);
      }
      //eliminar
      else if (opcion == 2) {
        this.deleteItem(item);
      }
    },
    obtenerDiferencia(fechaEmision, fechaVencimiento) {
      this.editedItem.diasAviso = 1;
      var fecha1 = moment(fechaEmision);
      var fecha2 = moment(fechaVencimiento);
      return fecha2.diff(fecha1, "days");
    },
    getNombre(status) {
      if (status == 3) return "Vigente";
      else if (status == 2) return "Por vencer";
      else return "Vencido";
    },
    getColor(status) {
      // console.log(status);
      if (status == 3) return "green";
      else if (status == 2) {
        return "orange";
      } else return "red";
    },
    downloadFile(file) {
      UploadService.download(file)
        .then((response) => {
          console.log(response);
        })
        .catch(() => {
          this.message = "No se puede descargar el archivo";
        });
    },
    selectFile(file) {
      this.progress = 0;
      this.currentFile = file;
    },
    async initialize() {
      await axios
        .get("subCarpeta/query?_id=" + this.$route.params.subFolder)
        .then((result) => {
          this.padre = result.data;
          this.getFolders(result.data._id);
        });
    },
    iniciarFile(element) {
      let fechaCrea = element.fechaCreacion.split("T");
      let fechaEmi = element.fechaEmision.split("T");
      let fechaCadu = element.fechaCaducidad.split("T");
      element.fechaCreacion = fechaCrea[0];
      element.fechaEmision = fechaEmi[0];
      element.fechaCaducidad = fechaCadu[0];

      var today = new Date();
      var now = today.toISOString();
      var cortado = now.split("T");
      var fecha1 = moment(element.fechaEmision);
      var fecha2 = moment(element.fechaCaducidad);
      var fecha3 = moment(element.fechaCaducidad);

      var diasVigencia = fecha2.diff(fecha1, "days");
      var diasRestantes = fecha3.diff(cortado[0], "days");

      element.diasVigencia = diasVigencia;
      element.diasRestantes = diasRestantes;
      console.log("nombre :" + element.nombre);
      console.log("Dias de vigencia: " + element.diasVigencia);
      console.log("Dias de aviso: " + element.diasAviso);
      console.log("Dias restantes: " + diasRestantes);
      console.log("---------------");

      if (diasRestantes < 1) {
        element.diasRestantes = 0;
      }

      if (diasRestantes == 0) {
        element.status = 1;
      } else if (diasRestantes > element.diasAviso) {
        element.status = 3;
      } else if (diasRestantes <= element.diasAviso && diasRestantes >= 1) {
        element.status = 2;
      } else {
        element.status = 1;
      }
    },
    async getFolders(id) {
      await axios
        .get("subCarpeta/getArchivos?_id=" + id)
        .then((res) => {
          let carpetas = res.data;
          carpetas.forEach((element) => {
            this.iniciarFile(element);
          });
          this.archivos = res.data;
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    eliminarDiacriticos(texto) {
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    upload() {
      this.isUpload = true;
      const resultado = this.archivos.find(
        (archivo) => archivo.nombre === this.editedItem.nombre
      );
      // console.log("Soy el resultado: " + this.editedItem.nombre);
      if(this.editedItem.nombre.length < 3){
        this.message = "Por favor ingrese un nombre con al menos 4 caracteres"
        this.isUpload = false;
        this.rechazado = true;
        this.e1 = 1;
        return;
      }
      if (resultado) {
        this.message = "Por favor ingrese otro nombre de archivo";
        this.isUpload = false;
        this.rechazado = true;
        this.e1 = 1;
        return;
      }
      if (!this.currentFile) {
        this.message = "Por favor seleccione un archivo";
        this.isUpload = false;
        this.rechazado = true;
        this.e1 = 1;
        return;
      }
      this.message = "";
      const myNewFile = new File(
        [this.currentFile],
        this.eliminarDiacriticos(this.currentFile.name),
        {
          type: this.currentFile.type,
        }
      );
      this.currentFile = myNewFile;
      UploadService.upload(this.currentFile, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
        .then((response) => {
          this.message = response.data.message;
          let direcion = this.currentFile.name;
          let peso = this.formatBytes(this.currentFile.size);
          this.editedItem.peso = peso;
          this.editedItem.archivo = direcion;
          this.editedItem.padre = this.padre._id;
          this.editedItem.abuelo = this.padre.padre;
          this.editedItem.padreSuperior = this.padre.padreSuperior;
          // console.log("Dias aviso:"+ this.editedItem.diasAviso);
          let calculo = this.fechaEm - this.editedItem.diasAviso;
          if (calculo == 0) {
            this.editedItem.diasAviso = 1;
          } else {
            this.editedItem.diasAviso = calculo;
          }
          this.postArchivo(this.editedItem);
        })
        .catch(() => {
          this.message = "No se puede subir archivo Excede máximo de 2 mb";
          this.isUpload = false;
          this.rechazado = true;
          this.currentFile = undefined;
        });
    },
    async postArchivo(archivo) {
      // console.log(archivo);
      await axios
        .post("archivo/add", archivo)
        .then((res) => {
          this.iniciarFile(res.data);
          this.archivos.push(res.data);
          this.actualizarHijos();
          this.isUpload = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    formatBytes(bytes, decimals = 2) {
      if (!+bytes) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
    async actualizarHijos() {
      let newIds = [];
      this.archivos.forEach((element) => {
        newIds.push(element._id);
      });

      await axios
        .put("subCarpeta/updateSubFolder/", {
          _id: this.padre._id,
          archivos: newIds,
        })
        .then((res) => {
          console.log(res);
          this.alerta = "Cambios realizados exitosamente";
          this.aceptado = true;
          this.close();
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    editItem(item) {
      this.editedIndex = this.archivos.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.archivos.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.archivos.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.e1 = 1;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    atras() {
      this.$router.go(-1);
    },
    save() {
      //Cuando se edita
      if (this.editedIndex > -1) {
        Object.assign(this.archivos[this.editedIndex], this.editedItem);
      } else {
        this.upload();
      }
      //this.close();
    },
  },
};
</script>

<style>
.texto {
  text-overflow: ellipsis;
}
</style>
