<template>
  <v-card>
    <!-- <p>{{ carpetas }}</p>
    <p>{{ finds }}</p> -->
    <snackbar ref="childComponent"></snackbar>
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text">
        {{ padre.nombre }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-text-field
        v-model="busqueda"
        label="Buscador"
        hide-details
        single-line
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
          >
            <v-icon>mdi-folder-plus</v-icon>
          </v-btn>
        </template>
        <span>Agregar carpeta</span>
      </v-tooltip>
    </v-toolbar>
    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-list v-if="!isLoading" two-line subheader>
      <v-subheader inset> Carpetas </v-subheader>
      <v-list-item v-for="item in resultadoBusqueda" :key="item.nombre" link>
        <v-list-item-avatar> <v-icon>mdi-folder </v-icon> </v-list-item-avatar>
        <v-list-item-content @click="enviarRuta(item)">
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
        <!-- <v-card-text>
          <h3>Apartados a controlar *</h3>
          <v-btn icon @click="addFind">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <div v-for="(find, index) in editedItem.parametros" :key="find.nombre">
            <v-text-field
              :label="'Apartado ' + (index + 1)"
              v-model="find.value"
              :key="index"
            />
          </div>
        </v-card-text> -->
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="save"> Guardar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import axios from "axios";
import loading from "../loading.vue";
import Snackbar from '../snackbar.vue';
export default {
  components: { loading, Snackbar },
  data: () => ({
    // finds: [],
    busqueda: "",
    isLoading: true,
    showDialog: false,
    padre: {},
    nombreCarpeta: "",
    descripcion: "",
    carpetas: {},
    editedIndex: -1,
    dialogDelete: false,
    items: [
      { title: "Editar", icon: "mdi-pencil", metodo: "editItem" },
      { title: "Eliminar", icon: "mdi-delete" },
    ],
    editedItem: {
      nombre:"",
      descripcion:"",
      // parametros:[]
    },
    defaulteditedItem: {
      nombre:"",
      descripcion:"",
      // parametros:[]
    },
  }),
  created() {
    this.initialize();
  },
  watch: {
    dialogDelete(val) {
      val || this.closeDelete();
    },
    showDialog (val) {
        val || this.close()
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
  methods: {
    addFind: function () {
      this.finds.push({ value: "" });
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
      
      this.deleteFolder(this.editedItem);
      this.closeDelete();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, {});
        this.editedIndex = -1;
      });
    },

    async deleteSubFolders(item) {
      console.log(item)
      await axios
        .delete("/carpeta/deleteSubFolders/" + item._id)
        .then((result) => {
          console.log(result);
          this.carpetas.splice(this.editedIndex, 1);
          this.$refs.childComponent.SnackbarShow("success","Carpeta eliminada correctamente")
          this.actualizarHijos();
        });
    },
    async deleteFolder(item) {
      await axios.delete("/carpeta/remove/" + item._id).then((result) => {
        this.deleteSubFolders(result.data);
      }).catch((e)=>{
        console.log(e)
        this.$refs.childComponent.SnackbarShow("error","No se ha podido elminar la carpeta")
      })
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
      if (this.editedIndex > -1) {
        const resultado = this.carpetas.find(
          (carpeta) => carpeta.nombre === this.editedItem.nombre
        );
        //Si no la encuentra la crea
        if (!resultado || resultado._id === this.editedItem._id) {
          console.log(this.editedItem.nombre);
          if (this.editedItem.nombre.length > 3) {
            this.actualizarCarpeta(this.editedItem, this.editedIndex);
            this.$refs.childComponent.SnackbarShow("success","Nombre modificado exitosamente")
            // this.alerta = "Nombre modificado exitosamente";
            // this.aceptado = true;
          }
          //this.aceptado = true;
          //this.actualizarSociedad2()
        } else {
          this.$refs.childComponent.SnackbarShow("error","El nombre ingresado de carpeta ya existe")
          // this.alerta = "El nombre utilizado de carpeta ya existe";
          // this.rechazado = true;
        }
      } else {
        this.createF();
      }
      this.close();
    },
    close() {
      this.showDialog = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = Object.assign({}, {});
        this.finds = Object.assign([],[])
      });
    },
    editItem(item) {
      console.log(item)
      this.editedIndex = this.carpetas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showDialog = true;
    },
    async actualizarHijos() {
      let newIds = [];
      this.carpetas.forEach((element) => {
        newIds.push(element._id);
      });

      console.log("Las carpetas son:")
      console.log(this.carpetas)

      await axios
        .put("sociedad/updateCarpetas/", {
          _id: this.padre._id,
          carpetas: newIds,
        })
        .then((res) => {
          console.log(res);
          this.$refs.childComponent.SnackbarShow("success","Cambios realizados exitosamente")
          // this.alerta = "Cambios realizados exitosamente";
          // this.aceptado = true;
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async initialize() {
      await axios
        .get("sociedad/queryNombre?nombre=" + this.$route.params.id)
        .then((result) => {
          this.padre = result.data;
          this.getFolders(result.data._id);
        });
    },
    async actualizarCarpeta(carpeta, index) {
      carpeta.nombre = this.editedItem.nombre;
      carpeta.descripcion = this.editedItem.descripcion;
      await axios
        .put("carpeta/update/", { _id: carpeta._id, carpeta: carpeta })
        .then((res) => {
          Object.assign(this.carpetas[index], res.data);
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    actualizarSociedad(sociedad, idNueva) {
      sociedad.carpetas.push(idNueva._id);
      axios
        .put("sociedad/update/", { _id: sociedad._id, sociedad: sociedad })
        .then((res) => {
          console.log(res);
          this.$refs.childComponent.SnackbarShow("success","Carpeta creada exitosamente")
          // this.alerta = "Carpeta creada exitosamente";
          // this.aceptado = true;
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async renameFolder(nuevoNombre, ruta) {
      axios
        .put("sociedad/renameFolder", { nuevoNombre: nuevoNombre, ruta: ruta })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async getFolders(id) {
      await axios
        .get("sociedad/queryFolders?_id=" + id)
        .then((res) => {
          this.carpetas = res.data;
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async postFolder(nuevaCarpeta) {
      await axios
        .post("carpeta/add", {carpeta: nuevaCarpeta})
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
        };
        //this.createServerFolder(nueva);
        this.postFolder(nueva);
      }
      else{
        this.$refs.childComponent.SnackbarShow("error","El nombre de la carpeta debe contener un largo minimo de 3 caracteres")
      }
      this.editedItem.nombre = "";
      this.descripcion = "";
    },
    createF() {
      const resultado = this.carpetas.find(
        (carpeta) => carpeta.nombre === this.editedItem.nombre
      );
      //Si no la encuentra la crea
      if (!resultado) {
        this.crearCarpeta();
      } else {
        this.$refs.childComponent.SnackbarShow("error", "El nombre ingresado de carpeta ya existe")
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
        name: "subFolders",
        params: { sociedad: this.padre.nombre, Folder: ruta._id },
      });
    },
  },
};
</script>
