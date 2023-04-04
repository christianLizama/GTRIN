<template>
  <v-layout align-center justify-center>
    <loading texto="enviado email" v-if="loading"></loading>
    <v-flex v-if="!loading" xs12 sm8 md6 lg4 xl3>
      <v-card height="100%" class="mx-auto pa-10 ma-10">
        <v-toolbar class="mb-8" dark color="primary">
          <v-toolbar-title class="flex text-center">
            Recuperar contraseña
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            :disabled="codeCreated"
            class="text-field-style"
            prepend-inner-icon="mdi-at"
            v-model="email"
            color="primary"
            label="Email para recuperar"
            outlined
          >
          </v-text-field>
          <v-flex class="red--text" v-if="errorM">
            {{ errorM }}
          </v-flex>
          <v-text-field
            :disabled="codeSuccess"
            v-if="codeCreated"
            class="text-field-style"
            prepend-inner-icon="mdi-counter"
            v-model="code"
            color="primary"
            label="Codigo recibido"
            outlined
          >
          </v-text-field>
          <v-flex class="green--text" v-if="codeCreated && !codeSuccess">
            Ingrese el codigo enviado a su correo electronico
          </v-flex>
          <v-text-field
            v-if="codeSuccess"
            class="text-field-style"
            prepend-inner-icon="mdi-lock"
            v-model="p1"
            color="primary"
            label="Ingrese su nueva contraseña"
            outlined
          >
          </v-text-field>
          <v-text-field
            v-if="codeSuccess"
            class="text-field-style"
            prepend-inner-icon="mdi-lock"
            v-model="p2"
            color="primary"
            label="Ingrese la contraseña nuevamente"
            outlined
          >
          </v-text-field>
          <v-flex class="red--text" v-if="noCoinciden">
            {{ noCoinciden }}
          </v-flex>
        </v-card-text>
        <v-card-actions class="px-3 pb-3 justify-center">
          <v-btn class="button" @click="ingresar()" dark color="primary"
            >Enviar Email</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from "axios";
import loading from "../components/loading.vue";
export default {
  components: { loading },
  data() {
    return {
      email: "",
      errorM: null,
      loading: false,
      code: "",
      codeCreated: false,
      codeSuccess: false,
      codeError: false,
      p1: "",
      p2: "",
      noCoinciden: "",
    };
  },
  methods: {
    async ingresar() {
      this.loading = true;
      if (this.codeSuccess) {
        if (this.p1 != this.p2) {
          this.noCoinciden = "Las contraseñas no coinciden";
          this.loading = false;
        } else if (this.p1.length < 8) {
          this.noCoinciden = "La contraseña debe tener al menos 8 caracteres";
          this.loading = false;
        } else {
          await axios
            .post("usuario/cambiarContrasena", { code: this.code, password: this.p1 })
            .then((res) => {
              return res.data;
            })
            .then((data) => {
              if (data) {
                this.loading = false;
                this.$router.push("/login");
              } else {
                this.errorM = "Error al cambiar contraseña";
                this.loading = false;
              }
            });
        }
        return;
      }
      if (this.codeCreated) {
        await axios
          .post("usuario/compararCodigo", { code: this.code })
          .then((res) => {
            return res.data;
          })
          .then((data) => {
            console.log(data);
            if (data) {
              this.codeSuccess = true;
              this.codeError = false;
            } else {
              this.coreError = true;
            }
            this.loading = false;
          });
        return;
      }
      await axios
        .post("usuario/recuperarContrasena", { email: this.email })
        .then((respuesta) => {
          return respuesta.data;
        })
        .then((res) => {
          if (res) {
            this.codeCreated = true;
          } else {
            this.errorM = "Este no es un mail correcto";
          }
          this.loading = false;
          this.errorM = null;
        })
        .catch(() => {
          //console.log(eror);
          this.errorM = null;
          this.loading = false;
          this.errorM = "Este no es un mail correcto.";
        });
    },
  },
};
</script>

<style>
.text-field-style >>> .v-text-field__slot input {
  color: red;
}
.button {
  width: 100%;
}
a:link {
  color: rgb(255, 124, 124);
  background-color: transparent;
  text-decoration: none;
}
a:visited {
  color: rgb(255, 124, 124);
  background-color: transparent;
  text-decoration: none;
}
a:hover {
  color: red;
  background-color: transparent;
  text-decoration: underline;
}
a:active {
  color: rgb(0, 0, 0);
  background-color: transparent;
  text-decoration: underline;
}
</style>
