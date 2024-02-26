<template>
  <div>
    <snackbar ref="childComponent"></snackbar>
    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-data-table
      :headers="headers"
      :items="resultadoBusqueda"
      sort-by="nombre"
      class="elevation-1"
      v-if="!isLoading"
    >
      <template v-slot:[`item.fechaCambioEstado`]="{ item }">
        {{ fechaFormateada(item.fechaCambioEstado) }}
      </template>
      <template v-slot:[`item.fechaEmision`]="{ item }">
        {{ fechaFormateada(item.fechaEmision) }}
      </template>
      <template v-slot:[`item.fechaCaducidad`]="{ item }">
        {{ fechaFormateada(item.fechaCaducidad) }}
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-chip :color="getColor(item.status, item)" dark>
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:[`item.archivo`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <div
              v-on="on"
              v-bind="attrs"
              class="text-truncate"
              style="max-width: 140px"
            >
              <Icon
                width="25"
                height="25"
                :icon="obtenerExtension(item.archivo)"
                class="mr-2"
              ></Icon>
              <a target="_blank" class="texto" :href="item.archivo"
                >{{ item.archivo.substring(item.archivo.lastIndexOf("/") + 1) }}
              </a>
            </div>
          </template>
          <span>{{
            item.archivo.substring(item.archivo.lastIndexOf("/") + 1)
          }}</span>
        </v-tooltip>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title v-if="searchClosed">Archivos</v-toolbar-title>
          <v-divider
            v-if="searchClosed"
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer v-if="searchClosed"></v-spacer>
          <v-text-field
            @focus="searchClosed = false"
            @blur="searchClosed = true"
            v-model="busqueda"
            clearable
            dense
            filled
            rounded
            placeholder="Buscar archivo"
            prepend-inner-icon="mdi-magnify"
            class="pt-6 expanding-search"
            :class="{ closed: searchClosed && !busqueda }"
          ></v-text-field>
          <v-dialog v-model="dialog" max-width="80%">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="blue">mdi-file-document-plus-outline</v-icon>
              </v-btn>
            </template>
            <v-card>
              <snackbar2 ref="childComponent2"></snackbar2>
              <v-toolbar dense dark>
                <v-btn icon @click="close">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title> Subir un archivo</v-toolbar-title>
              </v-toolbar>
              <loading texto="Subiendo Archivo" v-if="isUpload"></loading>
              <v-stepper v-if="!isUpload" v-model="e1">
                <v-stepper-header>
                  <v-stepper-step :complete="e1 > 1" step="1">
                    Subir archivo
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step :complete="e1 > 2" step="2">
                    Seleccionar Fechas
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step step="3"> Configurar Día </v-stepper-step>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-card class="mb-12 mx-auto" outlined color="lighten-1">
                      <v-card-title>
                        <span class="text-h5">{{ formTitle }}</span>
                      </v-card-title>
                      <v-container>
                        <v-row align="center" justify="center">
                          <v-col cols="12" sm="6" md="4">
                            <v-text-field
                              ref="form"
                              v-model="editedItem.nombre"
                              label="Nombre del archivo"
                              :rules="rules.nombre"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6" md="4">
                            <v-text-field
                              ref="form"
                              v-model="editedItem.descripcion"
                              label="Descripción"
                            ></v-text-field>
                          </v-col>
                          <v-col
                            v-if="editedIndex == -1"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <v-file-input
                              v-model="currentFile"
                              prepend-inner-icon="mdi-tray-arrow-up"
                              prepend-icon=""
                              show-size
                              label="Subir archivo"
                              @change="selectFile"
                            >
                            </v-file-input>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card>

                    <v-btn color="primary" text @click="close">
                      Cancelar
                    </v-btn>
                    <v-btn color="primary" @click="comprobar()">
                      Siguiente
                    </v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-card class="mb-12 mx-auto" outlined color="lighten-1">
                      <v-card-title>
                        <span class="text-h5">Fechas </span>
                      </v-card-title>
                      <v-card-text>
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
                                    v-model="editedItem.fechaEmisionFormateada"
                                    label="Fecha de emisión"
                                    prepend-icon="mdi-calendar"
                                    v-bind="attrs"
                                    @blur="
                                      editedItem.fechaEmision = parseDate(
                                        editedItem.fechaEmisionFormateada
                                      )
                                    "
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
                                    v-model="
                                      editedItem.fechaCaducidadFormateada
                                    "
                                    label="Fecha de caducidad"
                                    prepend-icon="mdi-calendar"
                                    v-bind="attrs"
                                    v-on="on"
                                    @blur="
                                      editedItem.fechaCaducidad = parseDate(
                                        editedItem.fechaCaducidadFormateada
                                      )
                                    "
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
                    <v-card class="mb-12 mx-auto" outlined color="lighten-1">
                      <v-card-title>
                        Establecer el día en que el archivo cambia al estado por
                        vencer
                      </v-card-title>
                      <v-card-text class="pa-4">
                        <v-slider
                          thumb-label="always"
                          label="Día(s)"
                          v-model="editedItem.diasAviso"
                          min="1"
                          :max="fechaEm - 1"
                        ></v-slider>
                        <p class="red--text">
                          Notificación
                          <b>{{
                            calcularDias(
                              editedItem.diasAviso,
                              editedItem.fechaCaducidad
                            )
                          }}</b>
                          día(s) antes de la fecha de vencimiento
                        </p>
                        <p class="red--text" v-if="editedItem.diasAviso == 0">
                          Día en que el archivo pasa a estado por vencer:
                          <b>Hoy</b>
                        </p>
                        <p class="red--text" v-else>
                          Día en que el archivo pasa a estado por vencer:
                          <b>{{ obtenerFecha(editedItem.diasAviso) }}</b>
                        </p>
                        <p>
                          Fecha de vencimiento:
                          <b>{{
                            fechaFormateada(editedItem.fechaCaducidad)
                          }}</b>
                        </p>
                        <p>
                          Maxima Cantidad de dias de aviso:
                          <b>{{ fechaEm - 1 }}</b>
                        </p>
                      </v-card-text>
                    </v-card>
                    <v-btn color="primary" @click="e1 = 2" text> Atras </v-btn>
                    <v-btn color="primary" @click="save"> Guardar </v-btn>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-toolbar dark color="grey darken-3" dense flat>
                <v-icon color="red" class="mr-2">mdi-alert</v-icon>
                <v-toolbar-title
                  class="text-body-4 font-weight-bold white--text"
                >
                  ¿Estás seguro?
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text class="pa-4 black--text"
                >Esta acción es irreversible
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="grey"
                  text
                  class="body-2 font-weight-bold"
                  @click="closeDelete"
                  >Cancelar</v-btn
                >
                <v-btn
                  color="red"
                  class="body-2 font-weight-bold"
                  outlined
                  @click="deleteItemConfirm"
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
import { mapState } from "vuex";
import axios from "axios";
import moment from "moment";
import location from "moment/dist/locale/es";
moment.updateLocale("es", location);
import UploadService from "../../services/UploadFilesService";
import loading from "../loading.vue";
import Snackbar from "../snackbar.vue";
import Snackbar2 from "../snackbar.vue";
import { Icon } from "@iconify/vue2";

export default {
  components: { Icon, loading, Snackbar, Snackbar2 },
  props: {
    Parametro: String,
    nombreParametro: String,
  },
  data: () => ({
    extensiones: [
      { type: "png", icon: "vscode-icons:file-type-image" },
      { type: "pdf", icon: "vscode-icons:file-type-pdf2", color: "red" },
      { type: "xlsx", icon: "vscode-icons:file-type-excel" },
      { type: "jpg", icon: "vscode-icons:file-type-image" },
      { type: "csv", icon: "vscode-icons:file-type-excel" },
    ],
    searchClosed: true,
    alerta: "",
    e1: 1,
    link: process.env.VUE_APP_SERVER_URL,
    seleccion: 1,
    busqueda: "",
    isLoading: true,
    snackTipe: false,
    isUpload: false,
    nombre: "",
    currentFile: undefined,
    dialog: false,
    dialogDelete: false,
    padre: {},
    menu: false,
    menu2: false,
    rules: {
      file: [(val) => val == undefined || "Sube un archivo"],
      nombre: [(val) => (val || "").length >= 4 || "Largo minimo 4 caracteres"],
    },

    items: [
      { title: "Editar", icon: "mdi-pencil" },
      { title: "Eliminar", icon: "mdi-delete" },
      { title: "Descargar", icon: "mdi-download" },
      { title: "Compartir", icon: "mdi-share" },
      { title: "Copiar url", icon: "mdi-clipboard-outline" },
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
      // { text: "Fecha Subida", value: "fechaCreacion", align: "center" },
      { text: "Fecha Emisión", value: "fechaEmision", align: "center" },
      {
        text: "Fecha estado por vencer",
        sortable: true,
        align: "center",
        value: "fechaCambioEstado",
      },
      { text: "Fecha Caducidad", value: "fechaCaducidad", align: "center" },
      { text: "Acciones", value: "actions", sortable: false, align: "center" },
    ],
    message: "",
    progress: 0,
    archivos: [],
    editedIndex: -1,
    editedItem: {
      nombre: "",
      descripcion: "",
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
      fechaCaducidad: moment().add(3, "days").toISOString().substr(0, 10),
      fechaCambioEstado: "",
      padre: "",
      abuelo: "",
      padreSuperior: "",
      parametro: "",
      usuarioCreador: "",
    },
    defaultItem: {
      nombre: "",
      archivo: "",
      descripcion: "",
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
      fechaCaducidad: moment().add(3, "days").toISOString().substr(0, 10),
      fechaCambioEstado: "",
      padre: "",
      abuelo: "",
      padreSuperior: "",
      parametro: "",
      usuarioCreador: "",
    },
  }),
  computed: {
    ...mapState(["usuario"]),
    fechaMaximaEmision() {
      this.fechasIguales();
      return moment().toISOString().substr(0, 10);
    },
    fechaMinimaCaducidad() {
      return moment(this.editedItem.fechaEmision)
        .add(3, "days")
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
    "editedItem.fechaEmision": function () {
      this.editedItem.fechaEmisionFormateada = this.formatDate(
        this.editedItem.fechaEmision
      );
    },
    "editedItem.fechaCaducidad": function () {
      this.editedItem.fechaCaducidadFormateada = this.formatDate(
        this.editedItem.fechaCaducidad
      );
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
    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;
      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    obtenerExtension(archivo) {
      const myUrl = archivo; // la URL almacenada como una cadena de texto
      const currentExtension = myUrl.substring(myUrl.lastIndexOf(".") + 1); // obtener la extensión

      let icono = "";
      this.extensiones.forEach((extension) => {
        if (extension.type == currentExtension) {
          icono = extension.icon;
        }
      });
      return icono;
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
    comprobar() {
      //Si falta el archivo y el nombre es mayor a 4 y se está subiendo un archivo
      if (
        this.editedItem.nombre.length >= 4 &&
        this.currentFile == undefined &&
        this.editedIndex == -1
      ) {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "Por favor sube un archivo"
        );
      }
      //Si esta editando y el nombre es mayor 4 pasamos al siguiente paso
      else if (this.editedItem.nombre.length >= 4 && this.editedIndex != -1) {
        this.e1 = 2;
      }
      //Si esta editando y el nombre es inferior a los 4 caracteres
      else if (this.editedItem.nombre.length < 4 && this.editedIndex != -1) {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "El nuevo nombre debe tener al menos 4 caracteres"
        );
      }
      //Si no estamos editando revisamos que esté subiendo un archivo y dando un nombre correcto
      else if (
        this.editedItem.nombre.length >= 4 &&
        this.currentFile != undefined
      ) {
        this.e1 = 2;
      } else {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "Por favor rellena todos los campos"
        );
      }
    },
    fechaFormateada(fecha) {
      let fechaFormat = moment(fecha).format("DD/MM/YYYY");
      return fechaFormat;
    },
    calcularDias(dias, fechaCaducidad) {
      let fecha1 = moment(this.editedItem.fechaEmision).add(dias, "days");
      let fecha2 = moment(fechaCaducidad);
      return fecha2.diff(fecha1, "days");
    },
    obtenerFechaAviso(item) {
      let fecha = moment(item.fechaEmision)
        .add(item.diasAviso, "days")
        .format("DD/MM/YYYY");
      return fecha;
    },
    fechasIguales() {
      if (
        this.obtenerDiferencia(
          this.editedItem.fechaEmision,
          this.editedItem.fechaCaducidad
        ) == 0 ||
        this.obtenerDiferencia(
          this.editedItem.fechaEmision,
          this.editedItem.fechaCaducidad
        ) < 0 ||
        this.obtenerDiferencia(
          this.editedItem.fechaEmision,
          this.editedItem.fechaCaducidad
        ) < 3
      ) {
        this.editedItem.fechaCaducidad = moment(this.editedItem.fechaEmision)
          .add(3, "days")
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
    async actualizarArchivo(Archivo, index) {
      await axios
        .put("archivo/update/", { _id: Archivo._id, archivo: Archivo })
        .then((res) => {
          this.iniciarFile(res.data);
          Object.assign(this.archivos[index], res.data);
          this.close();
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    deleteOrEdit(item, opcion) {
      opcion = opcion + 1;
      //Si es editar
      if (opcion == 1) {
        if(this.usuario.rol==="lector"){
          this.$refs.childComponent.SnackbarShow(
            "error",
            "No tienes permisos para editar"
          );
          return;
        }
        this.editItem(item);
      }
      //eliminar
      else if (opcion == 2) {
        this.deleteItem(item);
      } else if (opcion == 3) {
        this.downloadFile(item.archivo);
      } else if (opcion == 4) {
        this.shareFile(item);
      } else if (opcion == 5) {
        this.copiarAlPortapapeles(item.archivo);
      }
    },
    shareFile(archivo) {
      if (navigator.share) {
        navigator
          .share({
            title: `Nombre de archivo: ${archivo.nombre}`,
            text: "Archivo compartido desde la aplicación de gestión de archivos de Transportes Ruiz <p>hola</p>",
            url: archivo.archivo,
          })
          .then(() => console.log("Contenido compartido exitosamente"))
          .catch((error) => console.error("Error al compartir:", error));
      } else {
        console.log("La API de compartir no es compatible en este navegador.");
      }
    },

    copiarAlPortapapeles(archivo) {
      navigator.clipboard
        .writeText(archivo)
        .then(() => {
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Url copiada al portapapeles"
          );
        })
        .catch((error) => {
          console.error("Error al copiar al portapapeles:", error);
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Error al copiar al portapapeles"
          );
        });
    },

    obtenerDiferencia(fechaEmision, fechaVencimiento) {
      var fecha1 = moment(fechaEmision);
      var fecha2 = moment(fechaVencimiento);

      if (
        fecha2.diff(fecha1, "days") <= 1 ||
        this.editedItem.diasAviso > fecha2.diff(fecha1, "days")
      ) {
        this.editedItem.diasAviso = 1;
      }

      return fecha2.diff(fecha1, "days");
    },
    getColor(status) {
      switch (status) {
        case "Vigente":
          return "green";
        case "Por vencer":
          return "orange";
        case "Vencido":
          return "red";
        default:
          break;
      }
    },
    downloadFile(file) {
      let nombreArchivo = file.substring(file.lastIndexOf("/") + 1);
      UploadService.download(nombreArchivo)
        .then((response) => {
          var fileURL = window.URL.createObjectURL(new Blob([response.data]));
          var fileLink = document.createElement("a");

          fileLink.href = fileURL;
          fileLink.setAttribute("download", nombreArchivo);
          document.body.appendChild(fileLink);

          fileLink.click();
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
          this.getFiles(this.Parametro, this.padre);
        });
    },
    iniciarFile(element) {
      let fechaCambio = element.fechaCambioEstado.split("T");
      let fechaEmi = element.fechaEmision.split("T");
      let fechaCadu = element.fechaCaducidad.split("T");
      element.fechaCambioEstado = fechaCambio[0];
      element.fechaEmision = fechaEmi[0];
      element.fechaCaducidad = fechaCadu[0];
      element.fechaEmisionFormateada = moment(fechaEmi[0]).format("DD/MM/YYYY");
      element.fechaCaducidadFormateada = moment(fechaCadu[0]).format(
        "DD/MM/YYYY"
      );
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
    },
    async getFiles(id, padre) {
      const request = {
        params: {
          _id: id,
          padre: padre._id,
        },
      };
      await axios
        .get("subCarpeta/getArchivosParam", request)
        .then((res) => {
          let carpetas = res.data;
          carpetas.forEach((element) => {
            this.iniciarFile(element);
          });
          this.archivos = res.data;
          // console.log(res.data)
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
      if (this.editedItem.nombre.length < 4) {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "Por favor ingrese un nombre con al menos 4 caracteres"
        );
        // this.message = "Por favor ingrese un nombre con al menos 4 caracteres";
        this.isUpload = false;
        this.e1 = 1;
        return;
      }
      if (resultado) {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "Por favor ingrese otro nombre de archivo"
        );
        this.isUpload = false;
        this.e1 = 1;
        return;
      }
      if (!this.currentFile) {
        this.$refs.childComponent2.SnackbarShow(
          "error",
          "Por favor seleccione un archivo"
        );
        this.isUpload = false;
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
          let direcion = response.data.url;
          let peso = this.formatBytes(this.currentFile.size);
          this.editedItem.peso = peso;
          this.editedItem.archivo = direcion;
          this.editedItem.padre = this.padre._id;
          this.editedItem.abuelo = this.padre.padre;
          this.editedItem.padreSuperior = this.padre.padreSuperior;
          this.editedItem.parametro = this.Parametro;
          this.editedItem.usuarioCreador = this.$store.state.usuario._id;
          let fechaCambio = moment(this.editedItem.fechaEmision).add(
            this.editedItem.diasAviso,
            "days"
          );
          fechaCambio.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          this.editedItem.fechaCambioEstado = fechaCambio;

          // console.log("----------------------")
          // console.log("Emision: "+this.editedItem.fechaEmision)
          // console.log("Caducidad: "+this.editedItem.fechaCaducidad)
          // console.log("Cambio estado: "+fechaCambio._d)
          // console.log(new Date())
          // console.log("----------------------")
          if (new Date() >= moment(this.editedItem.fechaCaducidad)) {
            console.log("Estoy vencido");
            this.editedItem.status = "Vencido";
          } else if (new Date() >= fechaCambio._d) {
            console.log("Estoy por vencer");
            this.editedItem.status = "Por vencer";
          } else {
            console.log("Estoy vigente");
            this.editedItem.status = "Vigente";
          }
          // console.log("Fecha em: " + this.fechaEm);
          console.log("Dias aviso: " + this.editedItem.diasAviso);
          console.log(this.editedItem);
          this.postArchivo(this.editedItem);
        })
        .catch(() => {
          this.$refs.childComponent2.SnackbarShow(
            "error",
            "No se puede subir archivo Excede máximo de 5 mb"
          );
          this.isUpload = false;
          this.currentFile = undefined;
          this.e1 = 1;
        });
    },
    async postArchivo(archivo) {
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
          this.isUpload = false;
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
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Cambios realizados exitosamente"
          );
          this.close();
        })
        .catch((e) => {
          console.log(e.response);
          this.isLoading = false;
          this.$refs.childComponent.SnackbarShow(
            "error",
            "No se ha podido actualizar la subcarpeta"
          );
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
      this.borrarArchivo(this.archivos[this.editedIndex], this.editedIndex);
      this.closeDelete();
    },
    async borrarArchivo(archivo, index) {
      try {
        let nombreArchivo = archivo.archivo.substring(
          archivo.archivo.lastIndexOf("/") + 1
        );
        let idUsuario = this.$store.state.usuario._id;
        console.log(idUsuario);

        var data = {
          id: archivo._id,
          fileName: nombreArchivo,
          idUser: idUsuario,
        };

        await axios.delete("archivo/remove", { data }).then((result) => {
          this.$refs.childComponent.SnackbarShow(
            "success",
            result.data.message
          );
          this.archivos.splice(index, 1);
        });
      } catch (error) {
        if(error.response.status == 500){
          this.$refs.childComponent.SnackbarShow("error", "Error al borrar archivo");
        }
        else if(error.response.status == 403){
          this.$refs.childComponent.SnackbarShow("error", "No tienes permisos para borrar este archivo");
        }
        //this.$refs.childComponent.SnackbarShow("error", "Error al borrar archivo");  
      }
    },
    close() {
      this.resetValidation();
      this.dialog = false;
      this.e1 = 1;
      this.currentFile = undefined;
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
        const resultado = this.archivos.find(
          (archivo) => archivo.nombre === this.editedItem.nombre
        );

        //Si no la encuentra hace el update
        if (!resultado || resultado._id === this.editedItem._id) {
          if (this.editedItem.nombre.length > 3) {
            //Actualizamos la nueva
            this.editedItem.fechaCambioEstado = moment(
              this.editedItem.fechaEmision
            ).add(this.editedItem.diasAviso, "days");
            this.actualizarArchivo(this.editedItem, this.editedIndex);
            this.snackTipe = true;
            this.$refs.childComponent.SnackbarShow(
              "success",
              "Archivo modificado exitosamente"
            );
          } else {
            this.snackTipe = false;
            this.e1 = 1;
            this.$refs.childComponent2.SnackbarShow(
              "error",
              "El nombre del archivo debe tener un largo mayor a 3 caracteres"
            );
          }
        } else {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Ya existe un archivo con ese nombre"
          );

          return;
        }
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

<style lang="sass">
.v-input.expanding-search
  transition: max-width 0.3s
  .v-input__slot
    cursor: pointer !important
    &before, &:after
      border-color: transparent !important
  &.closed
    max-width: 50px
    .v-input__slot
      background-color: transparent !important
</style>
