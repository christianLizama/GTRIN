<template>
  <v-card>
    <v-toolbar dense dark>
      <v-btn @click="atras" big icon>
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text">
        {{ padre.nombre }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" icon @click="hidden = !hidden">
            <v-icon>{{ hidden ? "mdi-magnify" : "mdi-close" }}</v-icon>
          </v-btn>
        </template>
        <span>Buscar</span>
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
        <span>{{ encabezado }}</span>
      </v-tooltip>

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
    </v-toolbar>

    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-list v-if="!isLoading" two-line subheader>
      <div class="container">
        <v-expand-transition>
          <v-text-field
            v-show="!hidden"
            v-model="busqueda"
            clearable
            hide-details
            filled
            dense
            rounded
            full-width
            color="black darken"
            placeholder="Buscar Carpeta"
            prepend-inner-icon="mdi-folder-search-outline"
          ></v-text-field>
        </v-expand-transition>
      </div>

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
        
        <progress-file
          :archivosRequeridos="archivosRequeridos"
          :archivosSubidos="item.archivosSubidos"
        ></progress-file>

        <v-menu top left rounded="tr-xl" :offset-x="true" :offset-y="true">
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
        <v-toolbar dark color="grey darken-3" dense flat>
          <v-icon color="red" class="mr-2">mdi-alert</v-icon>
          <v-toolbar-title class="text-body-4 font-weight-bold white--text">
            ¿Estás seguro?
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-4 black--text"
          >Si borras esta carpeta se perdera todo su contenido
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
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogFindDelete" max-width="400px">
      <v-card>
        <v-toolbar dark color="grey darken-3" dense flat>
          <v-icon color="yellow" class="mr-2">mdi-alert</v-icon>
          <v-toolbar-title class="text-body-4 font-weight-bold white--text">
            ¿Estás seguro?
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-4">
          Si has eliminado parametros se borraran los archivos asociados a tales
          parametros.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closefindDelete">Cancelar</v-btn>
          <v-btn
            color="yellow"
            class="body-2 font-weight-bold"
            outlined
            text
            @click="updateParams()"
            >Actualizar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-toolbar dark color="black lighten-3" dense flat>
          <v-btn icon dark @click="showDialog = !showDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="text-body-4 font-weight-bold white--text">
            {{ formTitle }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-text-field
            outlined
            dense
            v-model="editedItem.nombre"
            label="Nombre"
            placeholder="Ingrese nombre de la carpeta"
          ></v-text-field>
          <v-text-field
            outlined
            dense
            v-model="editedItem.descripcion"
            label="Descripción"
            placeholder="Ingrese descripción"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            class="body-2 font-weight-bold"
            outlined
            text
            @click="save"
          >
            Guardar
          </v-btn>
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
        <v-toolbar dark color="black darken-3" dense flat>
          <v-btn icon dark @click="dialogParam = !dialogParam">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="text-body-4 font-weight-bold white--text">
            {{ encabezado }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-4">
          <!-- <h3>Apartados a controlar: *</h3> -->
          <h4>
            Agregar Apartado
            <v-btn icon @click="addFind">
              <v-icon color="green">mdi-plus</v-icon>
            </v-btn>
          </h4>

          <div v-for="(find, index) in finds" :key="find.nombre">
            <v-container>
              <v-row>
                <v-col cols="3">
                  <v-select
                    :items="options"
                    v-model="find.option"
                    dense
                    hide-details
                    class="my-5"
                    label="Requerido"
                    return-object
                  >
                    <template slot="item" slot-scope="data">
                      {{ yesOrNo(data.item) }}
                    </template>
                    <template slot="selection" slot-scope="data">
                      {{ yesOrNo(data.item) }}
                    </template>
                  </v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    :label="'Apartado ' + (index + 1)"
                    v-model="find.value"
                    :key="index"
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
          <v-btn
            color="grey"
            text
            class="body-2 font-weight-bold"
            @click="dialogParam = !dialogParam"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            class="body-2 font-weight-bold"
            outlined
            @click="dialogFindDelete = !dialogFindDelete"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Snackbar ref="childComponent"></Snackbar>
  </v-card>
</template>

<script>
import axios from "axios";
import loading from "../loading.vue";
import Snackbar from "../snackbar.vue";
import ProgressFile from "../ProgressFile.vue";
export default {
  components: { loading, Snackbar, ProgressFile },
  data: () => ({
    hidden: true,
    searchClosed: true,
    timeout: 7500,
    encabezado: "",
    addPermission: true,
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
    dialogDelete: false,
    dialogFindDelete: false,
    primerosParametros: [],
    archivosRequeridos: 0,
    options: [true, false],
    items: [
      { title: "Editar", icon: "mdi-pencil", metodo: "editItem" },
      { title: "Eliminar", icon: "mdi-delete" },
    ],
    editedItem: {
      nombre: "",
      descripcion: "",
      parametros: [],
    },
    defaultItem:{
      nombre: "",
      descripcion: "",
      parametros: [],
    }
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
    dialogParam(val) {
      val || this.cancelUpdateParams();
    },
  },
  methods: {
    yesOrNo(value) {
      if (value) {
        return "Si";
      } else {
        return "No";
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
          this.finds = result.data.parametros;
          this.primerosParametros = Object.assign([], result.data.parametros);
          // this.$root.Snackbar.SnackbarShow("success", "Parametros modificados exitosamente");
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Parametros modificados exitosamente"
          );
          this.eliminados = [];
          this.isUpload = false;
          this.dialogParam = false;
          if (result.data.parametros.length < 1) {
            this.addPermission = true;
          } else {
            this.addPermission = false;
          }
          this.dialogFindDelete = false;
        })
        .catch((e) => {
          console.log(e);
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Error agregando los parametros"
          );
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

          this.$refs.childComponent.SnackbarShow(
            "success",
            "Parametros agregados correctamente"
          );
          // this.textSnackbar = "Parametros agregados correctamente";
          // this.snackbar = true;
          this.isUpload = false;
          this.dialogParam = false;
        })
        .catch((e) => {
          console.log(e);
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Error agregando los parametros"
          );
          // this.textSnackbar = "Ha ocurrido un error";
          // this.snackbar = true;
        });
    },
    addFind: function () {
      this.finds.push({ value: "", del: 0, option: true });
    },
    deleteFind(item) {
      let index = this.finds.indexOf(item);
      if (item.del != 0) {
        let borrado = this.finds.splice(index, 1);
        this.eliminados.push(borrado[0]._id);
      } else {
        this.finds.splice(index, 1);
      }
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
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closefindDelete() {
      this.dialogFindDelete = false;
    },
    cancelUpdateParams() {
      this.eliminados = [];
      this.dialogParam = false;
      this.finds = Object.assign([], this.primerosParametros);
    },
    async deleteFiles(item) {
      await axios
        .delete("/carpeta/deleteSubFolders/" + item._id)
        .then((result) => {
          console.log(result);
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Carpeta eliminada correctamente"
          );
          // this.alerta = "Carpeta eliminada correctamente";
          // this.snackbar = true;
          // this.textSnackbar = "Carpeta eliminada correctamente";
          this.actualizarHijos();
        });
    },
    async deleteAllFiles(idPadre) {
      var data = {
        id: idPadre,
      };
      await axios.delete("archivo/removeAll", { data }).then((result) => {
        console.log(result.data);
      });
    },
    async deleteSubFolder(item) {
      await axios.delete("/subCarpeta/remove/" + item._id).then((result) => {
        this.actualizarHijos();
        this.deleteAllFiles(result.data._id);
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

            this.$refs.childComponent.SnackbarShow(
              "success",
              "Carpeta modificada exitosamente"
            );
            // this.textSnackbar = "Carpeta modificada exitosamente";
            // this.snackbar = true;
            // this.alerta = "Nombre modificado exitosamente";
            // this.aceptado = true;
          }
          //this.aceptado = true;
          //this.actualizarSociedad2()
        } else {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "El nombre utilizado de carpeta ya existe"
          );
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
        this.editedItem = Object.assign({}, this.defaultItem);
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
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Cambios realizados exitosamente"
          );
          // this.textSnackbar = "Cambios realizados exitosamente";
          // this.snackbar = true;
          // this.alerta = "Cambios realizados exitosamente";
          // this.aceptado = true;
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    contarRequeridos(parametros) {
      parametros.forEach((element) => {
        if (element.option) {
          this.archivosRequeridos = this.archivosRequeridos + 1;
        }
      });
    },
    async contar(subCarpeta, parametros) {
      let contador = 0;
      subCarpeta.archivosSubidos = 0;
      parametros.forEach(async (parametro) => {
        const request = {
          params: {
            _id: parametro._id,
            padre: subCarpeta._id,
          },
        };
        await axios.get("archivo/countFiles", request).then((result) => {
          parametro.cantidad = result.data;
          if (parametro.option) {
            if (parametro.cantidad > 0) {
              contador = contador + 1;
            }
          }
        });
        subCarpeta.archivosSubidos = contador;
      });
    },

    async initialize() {
      await axios
        .get("carpeta/query?_id=" + this.$route.params.Folder)
        .then((result) => {
          this.padre = result.data;
          this.getSubFolders(result.data._id);
          result.data.parametros.forEach((element) => {
            this.finds.push(element);
          });

          this.primerosParametros = result.data.parametros;
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
          this.contarRequeridos(this.primerosParametros);
          res.data.forEach((element) => {
            this.contar(element, this.primerosParametros);
          });
          this.carpetas = res.data;
          this.isLoading = false;
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
          res.data.archivosSubidos = 0;
          let nueva = res.data;
          nueva.archivosSubidos = 0;
          this.carpetas.push(nueva);
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
      } else {
        this.$refs.childComponent.SnackbarShow(
          "error",
          "El nombre de la carpeta debe contener un largo minimo de 4 caracteres"
        );
      }
    },
    createF() {
      const resultado = this.carpetas.find(
        (carpeta) => carpeta.nombre === this.editedItem.nombre
      );
      //Si no la encuentra la crea
      if (!resultado) {
        this.crearCarpeta();
      } else {
        this.$refs.childComponent.SnackbarShow(
          "error",
          "El nombre de carpeta ingresado ya existe"
        );
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

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
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
