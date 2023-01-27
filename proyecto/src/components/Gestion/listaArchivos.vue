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
      <v-toolbar-title class="white--text"> {{ padre.nombre }} </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-text-field
        v-model="busqueda"
        label="Buscador"
        hide-details
        single-line
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>

      <v-btn color="" @click="showDialog = !showDialog">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list two-line subheader>
      <v-subheader inset> archivos </v-subheader>
      <v-list-item v-for="item in resultadoBusqueda" :key="item.nombre" link>
        <v-list-item-avatar> <v-icon>mdi-folder </v-icon> </v-list-item-avatar>
        <v-list-item-content @click="enviarRuta(item)">
          <v-list-item-title>{{ item.nombre }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.fechaCreacion }}</v-list-item-subtitle>
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
        <v-card-title class="text-h5"> Borrar archivo </v-card-title>
        <v-divider inset></v-divider>
        <v-card-text> Estas seguro que deseas borrar este archivo? </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title> {{ formTitle }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="nombreArchivo" label="Nombre archivo"></v-text-field>
          <v-text-field
            v-model="descripcion"
            label="Descripción del archivo"
          ></v-text-field>
        </v-card-text>

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
export default {
  data: () => ({
    alerta: "",
    showDialog: false,
    busqueda: "",
    padre: {},
    nombreArchivo: "",
    descripcion: "",
    archivos: {},
    editedIndex: -1,
    aceptado: false,
    rechazado: false,
    dialogDelete: false,
    items: [
      { title: "Editar", icon: "mdi-pencil", metodo: "editItem" },
      { title: "Eliminar", icon: "mdi-delete" },
    ],
    editedItem: {},
  }),
  created() {
    this.initialize();
  },
  watch: {
    dialogDelete(val) {
      val || this.closeDelete();
    },
    showDialog(val) {
      if (val) {
        this.nombreCarpeta = "";
        this.descripcion = "";
      }
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
      return this.editedIndex === -1 ? "Nueva Carpeta" : "Editar nombre de la carpeta";
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
  methods: {
    deleteItem(item) {
      this.editedIndex = this.archivos.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.archivos.splice(this.editedIndex, 1);
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
      await axios.delete("/carpeta/deleteSubFolders/" + item._id).then((result) => {
        console.log(result);
        this.alerta = "Carpeta eliminada correctamente";
        this.aceptado = true;
        this.actualizarHijos();
      });
    },
    async deleteFolder(item) {
      console.log(item);
      await axios.delete("/carpeta/remove/" + item._id).then((result) => {
        console.log(result);
        this.deleteSubFolders(item);
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
        console.log("soy el otro");
        this.deleteItem(item);
      }
    },
    save() {
      //verificamos si estamos en modo edición o modo crear
      if (this.editedIndex > -1) {
        const resultado = this.archivos.find(
          (archivo) => archivo.nombre === this.nombreArchivo
        );
        //Si no lo encuentra procede a editarlo
        if (!resultado) {
          console.log(this.nombreArchivo);
          if (this.nombreArchivo.length > 3) {
            this.actualizarCarpeta(this.editedItem, this.editedIndex);
            this.alerta = "Nombre modificado exitosamente";
            this.aceptado = true;
          }
          //this.aceptado = true;
          //this.actualizarSociedad2()
        } else {
          this.alerta = "El nombre utilizado de carpeta ya existe";
          this.rechazado = true;
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
      });
    },
    editItem(item) {
      this.editedIndex = this.archivos.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showDialog = true;
    },
    async actualizarHijos() {
      let newIds = [];
      this.archivos.forEach((element) => {
        newIds.push(element._id);
      });

      await axios
        .put("sociedad/updateCarpetas/", { _id: this.padre._id, carpetas: newIds })
        .then((res) => {
          console.log(res);
          this.alerta = "Cambios realizados exitosamente";
          this.aceptado = true;
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    async initialize() {
      await axios
        .get("subCarpeta/query?_id=" + this.$route.params.subFolder)
        .then((result) => {
          this.padre = result.data;
          this.getFolders(result.data._id);
        });
    },
    async actualizarCarpeta(carpeta, index) {
      carpeta.nombre = this.nombreArchivo;
      carpeta.descripcion = this.descripcion;
      await axios
        .put("carpeta/update/", { _id: carpeta._id, carpeta: carpeta })
        .then((res) => {
          console.log(res);
          console.log(this.editedItem);
          Object.assign(this.archivos[index], carpeta);
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
          this.alerta = "Carpeta creada exitosamente";
          this.aceptado = true;
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
        .get("subCarpeta/getArchivos?_id=" + id)
        .then((res) => {
          this.archivos = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async postFolder(nuevaCarpeta) {
      await axios
        .post("carpeta/add", nuevaCarpeta)
        .then((res) => {
          this.archivos.push(res.data);
          this.actualizarHijos();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    crearCarpeta() {
      if (this.nombreArchivo.length > 3) {
        var nueva = {
          nombre: this.nombreArchivo,
          descripcion: this.descripcion,
          padre: this.padre._id,
        };

        //this.createServerFolder(nueva);
        this.postFolder(nueva);
      }
      this.nombreCarpeta = "";
      this.descripcion = "";
    },
    createF() {
      const resultado = this.archivos.find(
        (carpeta) => carpeta.nombre === this.nombreArchivo
      );
      //Si no la encuentra la crea
      if (!resultado) {
        this.crearCarpeta();
      } else {
        this.rechazado = "El nombre de carpeta ingresado ya existe";
        this.rechazado = true;
      }
    },
    //Crear carpeta en el servidor
    async createServerFolder(nueva) {
      var ruta = this.padre.ruta + "/" + this.nombreArchivo;
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
      console.log(ruta);
    },
    atras() {
      this.$router.go(-1);
    },
  },
};
</script>
