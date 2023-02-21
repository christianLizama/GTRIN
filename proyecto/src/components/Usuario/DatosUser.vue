<template>
  <div>
    <v-card
      style="border-top: 2px solid dark"
      class="mx-auto pa-10"
      max-width="450"
      max-height="2000"
    >
      <v-card-title> Datos Personales</v-card-title>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="name"
          :counter="10"
          :rules="nameRules"
          label="Nombre"
          required
        ></v-text-field>

        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Contraseña Actual"
          required
          type="password"
        ></v-text-field>

        <v-text-field
          v-model="newPassword"
          :rules="[passwordConfirmationRule()]"
          label="Nueva Contraseña"
          required
          type="password"
        ></v-text-field>

        <v-text-field
          v-model="rePassword"
          :rules="[passwordConfirmationRule()]"
          label="Confirmar nueva Contraseña"
          required
          type="password"
        ></v-text-field>

        <v-btn color="confirm" class="mr-4" @click="cambiarDatos"> Confirmar</v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      name: "",
      nameRules: [
        (v) => !!v || "El nombre es requerido",
        (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
      ],
      email: "",
      emailRules: [
        (v) => !!v || "E-mail es requerido",
        (v) => /.+@.+\..+/.test(v) || "El E-mail no es valido",
      ],
      password: "",
      newPassword: "",
      rePassword: "",
      passwordRules: [(v) => !!v || "La contraseña es requerida"],
      confirmPasswordRules: [(v) => !!v || "Nueva contraseña requerida"],
    };
  },
  computed: {
    passwordConfirmationRule() {
      return () => this.newPassword === this.rePassword || "Las contraseñas no coinciden";
    },
  },
  methods: {
    cambiarDatos() {
      console.log("Hola");
    },
    validate() {
      this.$refs.form.validate();
    },
  },
};
</script>

<style></style>
