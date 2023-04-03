<template>
  <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
    <snackbar ref="childComponent"></snackbar>
    <v-data-table :headers="headers" :items="admins" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Mis usuarios</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="20%">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Nuevo usuario
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    v-model="editedItem.nombreCompleto"
                    label="Nombre"
                  ></v-text-field>
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                  ></v-text-field>
                  <v-text-field
                    v-if="editedIndex == -1"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show1 = !show1"
                    v-model="editedItem.clave"
                    label="Clave"
                  ></v-text-field>
                  <v-select
                    v-model="editedItem.rol"
                    :items="rols"
                    label="Rol"
                  ></v-select>
                  <v-select
                    v-if="editedIndex != -1"
                    v-model="opcion"
                    label="Cambiar Contraseña"
                    :items="newPasswordOptions"
                  >
                  </v-select>
                  <v-text-field
                    v-if="editedIndex != -1"
                    :disabled="newPassword"
                    v-model="editedItem.newClave"
                    label="Nueva Contraseña"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show2 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show2 = !show2"
                  ></v-text-field>
                  <v-text-field
                    v-if="editedIndex != -1"
                    :disabled="newPassword"
                    v-model="editedItem.reNewClave"
                    label="Repetir Contraseña"
                    :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show3 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show3 = !show3"
                  ></v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="close"> Cancelar </v-btn>
                <v-btn color="primary" text @click="save"> Guardar </v-btn>
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
                >Esta acción es irreversible
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
                  >Aceptar</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon medium @click="editItem(item)">mdi-pencil </v-icon>
        <v-icon medium @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import axios from "axios";
import Snackbar from "../components/snackbar.vue";
export default {
  components: { Snackbar },
  data: () => ({
    valid: false,
    dialog: false,
    dialogDelete: false,
    newPassword: true,
    show1: false,
    show2: false,
    show3: false,
    headers: [
      { text: "Nombre", value: "nombreCompleto" },
      { text: "Rol", value: "rol" },
      { text: "Email", value: "email" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    rols: ["admin", "usuario"],
    newPasswordOptions: ["No", "Si"],
    admins: [],
    editedIndex: -1,
    opcion: "No",
    editedItem: {
      nombreCompleto: "",
      rol: "",
      email: "",
      clave: "",
      newClave: "",
      reNewClave: "",
    },
    defaultItem: {
      nombreCompleto: "",
      rol: "",
      email: "",
      clave: "",
      newClave: "",
      reNewClave: "",
    },
    indexAdmin: 0,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Usuario" : "Editar Usuario";
    },
    listaadmins() {
      return this.admins;
    },
  },
  watch: {
    opcion(newValue) {
      if (newValue == "Si") {
        this.newPassword = false;
      } else {
        this.newPassword = true;
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
    //this.initialize();
    this.listarAdmins();
  },
  methods: {
    initialize() {
      this.admins = [];
    },
    editItem(item) {
      item.option = "No";
      this.editedIndex = this.admins.indexOf(item);
      this.editedItem = Object.assign({}, item);
      //this.editedItem.option = "No";
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.admins.indexOf(item);
      this.editedItem = Object.assign({}, item);
      //this.editedItem.option = "No";
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios
        .post("usuario/removeUsuario", {
          _id: this.admins[this.editedIndex]._id,
        })
        .then(() => {
          this.admins.splice(this.editedIndex, 1);
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Usuario eliminado con exito"
          );
        });
      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
      //this.listarAdmins();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.$refs.form.resetValidation();
      });
      this.listarAdmins();
    },
    async save() {
      //this.listarAdmins()
      if (this.editedIndex > -1) {
        //Editar usuario
        if (
          this.opcion == "Si" &&
          this.editedItem.newClave == this.editedItem.reNewClave
        ) {
          console.log(this.editedItem.newClave);
          await axios
            .put("usuario/updateUsuario", {
              _id: this.editedItem._id,
              nombreCompleto: this.editedItem.nombreCompleto,
              email: this.editedItem.email,
              rol: this.editedItem.rol,
              clave: this.editedItem.newClave,
              option: this.opcion,
            })
            .then((res) => {
              console.log(this.editedItem);
              Object.assign(this.admins[this.editedIndex], res.data);
              this.close();
              this.$refs.childComponent.SnackbarShow(
                "success",
                "Usuario editado exitosamente"
              );
            });
        } else {
          if (this.editedItem.option == "No") {
            console.log("hola");
            await axios
              .put("usuario/updateUsuario", {
                _id: this.editedItem._id,
                nombreCompleto: this.editedItem.nombreCompleto,
                email: this.editedItem.email,
                rol: this.editedItem.rol,
                clave: this.editedItem.clave,
                option: this.opcion,
              })
              .then((res) => {
                console.log(res.data);
                Object.assign(this.admins[this.editedIndex], res.data);
                this.close();
                this.$refs.childComponent.SnackbarShow(
                  "success",
                  "Usuario editado exitosamente"
                );
              });
          } else {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "Las claves no coinciden"
            );
          }
        }
      } else {
        //Crear usuario
        if (
          this.editedItem.nombreCompleto.length < 3 ||
          this.editedItem.email.length < 3
        ) {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Completar todos los campos"
          );
        } else if (this.editedItem.clave.length < 8) {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "La contraseña debe tener un largo mayor a 8 caracteres"
          );
        } else {
          await axios
            .post("usuario/postUsuario", {
              rol: this.editedItem.rol,
              nombreCompleto: this.editedItem.nombreCompleto,
              email: this.editedItem.email,
              clave: this.editedItem.clave,
            })
            .then((res) => {
              if (!res.data) {
                this.$refs.childComponent.SnackbarShow("error", "Este correo ya se encuentra registrado");
              } else {
                this.$refs.childComponent.SnackbarShow(
                  "success",
                  "Usuario creado exitosamente"
                );
                this.admins.push(res.data);
                this.close();
              }
            });
        }
      }
    },
    async listarAdmins() {
      let me = this;
      await axios
        .get("usuario/getUsuarios")
        .then(function (response) {
          me.admins = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
};
</script>
