<template>
  <v-card>
    <v-alert v-model="aceptado" dense text type="success">
      {{ alerta }}
    </v-alert>
    <v-alert v-model="rechazado" dense outlined type="error">
      {{ alerta }}
    </v-alert>
    <v-toolbar dense dark>
      <v-btn @click="atras" big icon>
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text">
        {{ padre.nombre }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-text-field
        label="Buscador"
        hide-details
        single-line
        v-model="busqueda"
        prepend-inner-icon="mdi-magnify"
        class="shrink"
      ></v-text-field>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            dark
            v-bind="attrs"
            v-on="on"
            @click="showDialog = !showDialog"
            :disabled="addPermission"
          >
            <v-icon>mdi-folder-plus</v-icon>
          </v-btn>
        </template>
        <span>Agregar carpeta</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            dark
            v-bind="attrs"
            v-on="on"
            @click="dialogParam = !dialogParam"
          >
            <v-icon>mdi-folder-cog</v-icon>
          </v-btn>
        </template>
        <span>Crear Parametrización</span>
      </v-tooltip>
    </v-toolbar>
    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-list v-if="!isLoading" two-line subheader>
      <v-subheader inset> Sub-Carpetas </v-subheader>

      <v-list-item
        v-for="item in resultadoBusqueda"
        :key="item.nombre"
        link
        @click="enviarRuta(item)"
      >
        <v-list-item-avatar> <v-icon>mdi-folder </v-icon> </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.nombre }}</v-list-item-title>
          <v-list-item-subtitle>{{
            obtenerFecha(item.fechaCreacion)
          }}</v-list-item-subtitle>
        </v-list-item-content>

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

        <v-list-item-action>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="grey lighten-1"> mdi-information </v-icon>
              </v-btn>
            </template>
            <span v-if="!!item.descripcion">{{ item.descripcion }}</span>
            <span v-else>Esta carpeta no posee descripcion</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h5"> Borrar Carpeta </v-card-title>
        <v-divider inset></v-divider>
        <v-card-text>
          Estas seguro que deseas borrar esta carpeta y todo su contenido?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" text @click="deleteItemConfirm"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title> {{ formTitle }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedItem.nombre"
            label="Nombre carpeta"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.descripcion"
            label="Descripción"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="save"> Guardar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Dialogo de parametrización -->

    <v-dialog v-model="dialogParam" max-width="500px">
      <v-card v-if="isUpload">
        <loading
          texto="Subiendo Datos"
          :overlay="false"
          v-if="isUpload"
        ></loading>
      </v-card>
      <v-card v-if="!isUpload">
        <v-card-title>{{ encabezado }}</v-card-title>
        <v-card-text>
          <!-- <h3>Apartados a controlar: *</h3> -->
          <h4>
            Agregar Apartado
            <v-btn icon @click="addFind">
              <v-icon color="green">mdi-plus</v-icon>
            </v-btn>
          </h4>

          <div v-for="(find, index) in finds" :key="find.nombre">
            <v-container>
              <v-row >
                <v-col>
                  <v-text-field
                    :label="'Apartado ' + (index + 1)"
                    v-model="find.value"
                    :key="index"
                    a
                  >
                    <v-icon
                      @click="deleteFind(find)"
                      slot="append-outer"
                      color="red"
                    >
                      mdi-minus
                    </v-icon>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="secondary" @click="dialogParam = !dialogParam"
            >Cancelar</v-btn
          >
          <v-btn text color="primary" @click="updateParams()"> Guardar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :multi-line="snackbar.mode === 'multi-line'"
      :timeout="snackbar.timeout"
      :top="snackbar.position === 'top'"
    >
      <v-container>
        <v-row align="center" justify="center" class="d-flex">
          <v-col cols="auto">
            <v-icon dark large>{{ snackbar.icon }}</v-icon>
          </v-col>
          <v-col cols="auto">
            <div>
              <strong>{{ snackbar.title }}</strong>
            </div>
            <div>{{ snackbar.text }}</div>
          </v-col>
          <v-col cols="auto">
            <v-btn icon @click="snackbar.visible = false">
              <v-icon>mdi-close-thick</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios";
import loading from "../loading.vue";
export default {
  components: { loading },
  data: () => ({
    snackbar: {
      color: null,
      icon: null,
      mode: null,
      position: "top",
      text: null,
      timeout: 7500,
      title: null,
      visible: false,
    },
    timeout: 7500,
    encabezado: "",
    addPermission: true,
    alerta: "",
    finds: [],
    eliminados: [],
    showDialog: false,
    dialogParam: false,
    isLoading: true,
    isUpload: false,
    padre: {},
    busqueda: "",
    carpetas: {},
    editedIndex: -1,
    aceptado: false,
    rechazado: false,
    dialogDelete: false,
    items: [
      { title: "Editar", icon: "mdi-pencil", metodo: "editItem" },
      { title: "Eliminar", icon: "mdi-delete" },
    ],
    editedItem: {
      nombre: "",
      descripcion: "",
      parametros: [],
    },
  }),
  created() {
    this.initialize();
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nueva Carpeta"
        : "Editar nombre de la carpeta";
    },
    resultadoBusqueda() {
      if (this.busqueda) {
        return this.carpetas.filter((item) => {
          return this.busqueda
            .toLowerCase()
            .split(" ")
            .every((v) => item.nombre.toLowerCase().includes(v));
        });
      } else {
        return this.carpetas;
      }
    },
  },
  watch: {
    dialogDelete(val) {
      val || this.closeDelete();
    },
    showDialog(val) {
      val || this.close();
    },
    aceptado(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.aceptado = false;
        }, 3000);
      }
    },
    rechazado(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.rechazado = false;
        }, 3000);
      }
    },
  },
  methods: {
    SnackbarShow(type,texto) {
      if (!type) return;
      switch (type) {
        case "error":
          this.snackbar = {
            color: "error",
            icon: "mdi-car-brake-alert",
            mode: "multi-line",
            position: "top",
            timeout: 7500,
            title: "Error",
            text: texto,
            visible: true,
          };
          break;
        case "info":
          this.snackbar = {
            color: "info",
            icon: "mdi-info",
            mode: "multi-line",
            position: "top",
            timeout: 0,
            title: "Information",
            text: texto,
            visible: true,
          };
          break;
        case "success":
          this.snackbar = {
            color: "success",
            icon: "mdi-check-circle-outline",
            mode: "multi-line",
            position: "top",
            timeout: 7500,
            title: "Exitoso",
            text: texto,
            visible: true,
          };
          break;
        case "warning":
          this.snackbar = {
            color: "warning",
            icon: "mdi-car-brake-alert",
            mode: "multi-line",
            position: "top",
            timeout: 7500,
            title: "Warning",
            text: texto,
            visible: true,
          };
          break;
      }
    },
    async updateParams() {
      this.isUpload = true;
      await axios
        .put("/carpeta/updateParams/", {
          id: this.padre._id,
          parametros: this.finds,
          eliminados: this.eliminados,
        })
        .then((result) => {
          console.log(result);
          this.SnackbarShow("success","Parametros agregados correctamente");
          // this.textSnackbar = "Parametros agregados correctamente";
          // this.snackbar = true;
          this.eliminados=[]
          this.isUpload = false;
          this.dialogParam = false;
          this.addPermission = false;
        })
        .catch((e) => {
          console.log(e);
          this.SnackbarShow("error","Error agregando los parametros");
          this.isUpload = false;
        });
    },
    async addParams() {
      this.isUpload = true;
      await axios
        .put("/carpeta/addParams/", {
          id: this.padre._id,
          parametros: this.finds,
        })
        .then((result) => {
          console.log(result);
          
          this.SnackbarShow("success","Parametros agregados correctamente");
          // this.textSnackbar = "Parametros agregados correctamente";
          // this.snackbar = true;
          this.isUpload = false;
          this.dialogParam = false;
        })
        .catch((e) => {
          console.log(e);
          this.SnackbarShow("error");
          // this.textSnackbar = "Ha ocurrido un error";
          // this.snackbar = true;
        });
    },
    addFind: function () {
      this.finds.push({ value: "" });
    },
    deleteFind(item) {
      console.log(this.finds)
      let index = this.finds.indexOf(item);
      let key = "_id"
      var hasKey = (index[key] !== undefined);
      console.log(hasKey)
      let borrado = this.finds.splice(index, 1);
      this.eliminados.push(borrado[0]);
    },
    obtenerFecha(fecha) {
      let retorno = fecha.split("T");
      return retorno[0];
    },
    deleteItem(item) {
      this.editedIndex = this.carpetas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.carpetas.splice(this.editedIndex, 1);
      this.deleteSubFolder(this.editedItem);
      this.closeDelete();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, {});
        this.editedIndex = -1;
      });
    },

    async deleteFiles(item) {
      await axios
        .delete("/carpeta/deleteSubFolders/" + item._id)
        .then((result) => {
          console.log(result);
          this.SnackbarShow("success","Carpeta eliminada correctamente");
          // this.alerta = "Carpeta eliminada correctamente";
          // this.snackbar = true;
          // this.textSnackbar = "Carpeta eliminada correctamente";
          this.actualizarHijos();
        });
    },
    async deleteSubFolder(item) {
      console.log(item);
      await axios.delete("/subCarpeta/remove/" + item._id).then((result) => {
        console.log(result);
        this.actualizarHijos();
        //this.deleteFiles(item);
      });
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
    save() {
      //Cuando se edita una carpeta
      if (this.editedIndex > -1) {
        const resultado = this.carpetas.find(
          (carpeta) => carpeta.nombre === this.editedItem.nombre
        );
        //Si no la encuentra la crea
        if (!resultado || resultado._id === this.editedItem._id) {
          console.log(this.editedItem.nombre);
          if (this.editedItem.nombre.length > 3) {
            this.actualizarSubCarpeta(this.editedItem, this.editedIndex);

            this.SnackbarShow("success","Carpeta modificada exitosamente");
            // this.textSnackbar = "Carpeta modificada exitosamente";
            // this.snackbar = true;
            // this.alerta = "Nombre modificado exitosamente";
            // this.aceptado = true;
          }
          //this.aceptado = true;
          //this.actualizarSociedad2()
        } else {
          this.SnackbarShow("error","El nombre utilizado de carpeta ya existe");
          // this.alerta = "El nombre utilizado de carpeta ya existe";
          // this.rechazado = true;
        }
      } else {
        // if (this.ultimosParametros.length > 1) {
        //   this.finds = this.ultimosParametros;
        // }
        this.createF();
      }
      this.close();
    },
    close() {
      this.showDialog = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = Object.assign({}, {});
        // this.finds = this.ultimosParametros;
        // this.editedItem.parametros = Object.assign([],[])
      });
    },
    editItem(item) {
      this.editedIndex = this.carpetas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      // this.finds = item.parametros;
      this.showDialog = true;
    },
    async actualizarHijos() {
      let newIds = [];
      this.carpetas.forEach((element) => {
        newIds.push(element._id);
      });

      await axios
        .put("carpeta/updateHijos/", { _id: this.padre._id, hijos: newIds })
        .then((res) => {
          console.log(res);
          this.SnackbarShow("success","Cambios realizados exitosamente");
          // this.textSnackbar = "Cambios realizados exitosamente";
          // this.snackbar = true;
          // this.alerta = "Cambios realizados exitosamente";
          // this.aceptado = true;
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async initialize() {
      await axios
        .get("carpeta/query?_id=" + this.$route.params.Folder)
        .then((result) => {
          this.padre = result.data;
          this.getSubFolders(result.data._id);
          this.finds = result.data.parametros;
          if (result.data.parametros.length >= 1) {
            this.addPermission = false;
            this.encabezado = "Editar Parametros";
          } else {
            this.encabezado = "Agregar Parametros";
          }
        });
    },
    async actualizarSubCarpeta(carpeta, index) {
      carpeta.nombre = this.editedItem.nombre;
      carpeta.descripcion = this.editedItem.descripcion;
      await axios
        .put("subCarpeta/update/", { _id: carpeta._id, subCarpeta: carpeta })
        .then((res) => {
          console.log(res);
          console.log(this.editedItem);
          Object.assign(this.carpetas[index], carpeta);
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    actualizarCarpeta(carpeta, idNueva) {
      carpeta.hijos.push(idNueva._id);
      axios
        .put("carpeta/update/", { _id: carpeta._id, carpeta: carpeta })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async getSubFolders(id) {
      await axios
        .get("carpeta/querysubFolders?_id=" + id)
        .then((res) => {
          this.carpetas = res.data;
          this.isLoading = false;
          // if (this.carpetas.length >= 1) {
          //   this.ultimosParametros = this.carpetas[0].parametros;
          //   this.finds = this.ultimosParametros;
          // }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async postFolder(nuevaCarpeta) {
      await axios
        .post("subCarpeta/add", {
          carpeta: nuevaCarpeta,
        })
        .then((res) => {
          this.carpetas.push(res.data);
          this.actualizarHijos();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    crearCarpeta() {
      if (this.editedItem.nombre.length > 3) {
        var nueva = {
          nombre: this.editedItem.nombre,
          descripcion: this.editedItem.descripcion,
          padre: this.padre._id,
          padreSuperior: this.padre.padre,
        };
        //this.createServerFolder(nueva);
        this.postFolder(nueva);
        this.dialog = false;
      }
    },
    createF() {
      const resultado = this.carpetas.find(
        (carpeta) => carpeta.nombre === this.editedItem.nombre
      );
      console.log(resultado);
      //Si no la encuentra la crea
      if (!resultado) {
        this.crearCarpeta();
      } else {
        this.SnackbarShow("error","El nombre de carpeta ingresado ya existe");
        // this.textSnackbar = "El nombre de carpeta ingresado ya existe";
        // this.snackbar = true;
        // this.alerta = "El nombre de carpeta ingresado ya existe";
        // this.rechazado = true;
      }
    },
    //Crear carpeta en el servidor
    async createServerFolder(nueva) {
      var ruta = this.padre.ruta + "/" + this.editedItem.nombre;
      var params = { ruta: ruta };
      await axios
        .post("sociedad/addFolder", params)
        .then((res) => {
          console.log(res);
          //Si no es una carpeta repetida y se logro agregar la agregamos visualmente y en la db
          if (res.data == true) {
            this.aceptado = true;
            this.postFolder(nueva);
          } else {
            this.rechazado = true;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    enviarRuta(ruta) {
      this.$router.push({
        name: "files",
        params: {
          sociedad: this.padre.nombre,
          Folder: this.$route.params.Folder,
          subFolder: ruta._id,
        },
      });
    },
    atras() {
      this.$router.go(-1);
    },
  },
};
</script>
