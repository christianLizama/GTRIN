<template>
  <div class="">
    <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
      <v-data-table
        :headers="headers"
        :items="desserts"
        sort-by="calories"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Contenedores</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-btn
              @click="actualizarStatus"
              color="primary"
              dark
              class="mb-2 mr-2"
            >
              update status
            </v-btn>

            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Agregar
                </v-btn>
              </template>
              <v-card>
                <v-toolbar dark color="black lighten-3" dense flat>
                  <v-btn icon dark @click="dialog = !dialog">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    class="text-body-4 font-weight-bold white--text"
                  >
                    {{ formTitle }}
                  </v-toolbar-title>
                </v-toolbar>

                <v-card-text class="pa-4">
                  <v-text-field
                    outlined
                    v-model="editedItem.nombre"
                    label="Nombre"
                    placeholder="Ingrese nombre de la carpeta"
                  ></v-text-field>
                  <v-text-field
                    outlined
                    v-model="editedItem.descripcion"
                    label="Descripción"
                    placeholder="Ingrese descripción"
                  ></v-text-field>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    text
                    class="body-2 font-weight-bold"
                    @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    class="body-2 font-weight-bold"
                    outlined
                    @click="save"
                  >
                    Guardar
                  </v-btn>
                </v-card-actions>
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
                  >Un contenedor no puede ser eliminado si contiene carpetas
                  dentro
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    text
                    class="body-2 font-weight-bold"
                    @click="closeDelete"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="red"
                    class="body-2 font-weight-bold"
                    outlined
                    @click="deleteItemConfirm"
                    >Eliminar</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.acciones`]="{ item }">
          <v-menu top left rounded="tr-xl" :offset-x="true" :offset-y="true">
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </template>
                <span>Acciones</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item link @click="editItem(item)">
                <v-list-item-title>
                  <v-icon>mdi-pencil</v-icon>
                  Editar
                </v-list-item-title>
              </v-list-item>
              <v-list-item link @click="deleteItem(item)">
                <v-list-item-title>
                  <v-icon>mdi-delete</v-icon>
                  Eliminar
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:[`item.fechaCreacion`]="{ item }">
          {{ fechaFormateada(item.fechaCreacion) }}
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Reset </v-btn>
        </template>
      </v-data-table>
      <snackbar ref="childComponent"></snackbar>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import snackbar from "../snackbar.vue";
export default {
  components: { snackbar },
  data: () => ({
    dialog: false,
    dialogDelete: false,

    direction: "left",
    fabx: false,
    hover: false,
    transition: "slide-y-reverse-transition",

    headers: [
      {
        text: "Nombre contenedor",
        align: "start",
        sortable: false,
        value: "nombre",
      },
      { text: "Fecha Creación", value: "fechaCreacion" },
      { text: "Descripción", value: "descripcion" },
      { text: "Actions", value: "acciones", sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      nombre: "",
      descripcion: "",
      fechaCreacion: "",
    },
    defaultItem: {
      nombre: "",
      descripcion: "",
      fechaCreacion: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Contenedor" : "Editar Contenedor";
    },
    // computed: {
    //   ...mapState(['contenedores'])
    // },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async actualizarStatus() {
      await axios.put("archivo/updateStatus").then((result) => {
        console.log(result.data);
      });
    },
    fechaFormateada(fecha) {
      let fechaFormat = moment(fecha).format("DD/MM/YYYY");
      return fechaFormat;
    },
    async initialize() {
      await axios
        .get("sociedad/getPadres")
        .then((res) => {
          this.desserts = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteContenedor(item, index) {
      await axios
        .delete("/sociedad/remove/" + item._id)
        .then((result) => {
          this.$store.dispatch("eliminarContenedor", result.data);
          this.desserts.splice(index, 1);
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Contenedor eliminado exitosamente"
          );
        })
        .catch((e) => {
          console.log(e);
          this.$refs.childComponent.SnackbarShow(
            "error",
            "No se ha podido elminar la carpeta"
          );
        });
    },

    async verificarExistencias(item, index) {
      await axios
        .get("sociedad/queryFolders?_id=" + item._id)
        .then((res) => {
          this.carpetas = res.data;
          if (this.carpetas.length < 1) {
            this.deleteContenedor(item, index);
          } else {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "No se puede borrar este contenedor porque contiene carpetas"
            );
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    deleteItemConfirm() {
      this.verificarExistencias(this.editedItem, this.editedIndex);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
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
    agregarContenedor(contenedor) {
      this.$store.dispatch("agregarContenedor", contenedor);
    },
    async postSociedad(nuevaSociedad) {
      await axios
        .post("sociedad/add", nuevaSociedad)
        .then((res) => {
          res.data.cumplimiento = [];
          res.data.folders = [];
          this.desserts.push(res.data);
          this.agregarContenedor(res.data);
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Contenedor agregado exitosamente"
          );
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updateContenedor(contenedor, index) {
      console.log(contenedor._id);
      await axios
        .put("sociedad/update/", { _id: contenedor._id, sociedad: contenedor })
        .then((res) => {
          Object.assign(this.desserts[index], res.data);
          this.$store.dispatch("modificarContenedor", this.desserts);
          this.$refs.childComponent.SnackbarShow(
            "success",
            "El contenedor ha sido modificado exitosamente"
          );
        })
        .catch((e) => {
          console.log(e.response);
        });
    },
    crearSociedad() {
      const resultado = this.desserts.find(
        (sociedad) => sociedad.nombre === this.editedItem.nombre
      );
      if (!resultado || resultado._id === this.editedItem._id) {
        this.editedItem.fechaCreacion = moment();
        this.postSociedad(this.editedItem);
      } else {
        this.$refs.childComponent.SnackbarShow(
          "error",
          "El nombre del contenedor ingresado ya existe"
        );
      }
    },
    save() {
      //Si se edita
      if (this.editedIndex > -1) {
        const resultado = this.desserts.find(
          (sociedad) => sociedad.nombre === this.editedItem.nombre
        );
        if (!resultado || resultado._id === this.editedItem._id) {
          console.log(this.editedItem);
          this.updateContenedor(this.editedItem, this.editedIndex);
        } else {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "El nombre del contenedor modificado ya existe"
          );
        }
      } else {
        if (this.editedItem.nombre.length >= 3) {
          this.crearSociedad();
        } else {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "El nombre del contenedor debe contener un largo minimo de 3 caracteres"
          );
        }
        // this.desserts.push(this.editedItem);
      }
      this.close();
    },
  },
};
</script>

<style>
/* This is for documentation purposes and will not be needed in your application */
#create .v-speed-dial {
  position: absolute;
}

#create .v-btn--floating {
  position: relative;
}
</style>
