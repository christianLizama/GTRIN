<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10">
        <v-card class="elevation-6 mt-15">
          <v-row>
            <v-col cols="12" md="6" class="blue rounded-bl-xl">
              <div style="text-align: center; padding: 180px 0">
                <v-card-text class="white--text">
                  <h3 class="text-center">Hola</h3>
                  <h6 class="text-center">
                    Bienvenido al sistema de transportes ruiz<br />
                    disfruta tu experiencia
                  </h6>
                </v-card-text>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-card-text class="mt-12">
                <h4 class="text-center">Ingresar al sistema</h4>
                <h6 class="text-center grey--text">
                  Iniciar sesión en la cuenta para poder
                  <br />administrar este sistema
                </h6>
                <v-row align="center" justify="center">
                  <v-col cols="12" sm="8">
                    <v-text-field
                      label="Email"
                      outlined
                      dense
                      color="blue"
                      autocomplete="false"
                      class="mt-16"
                    />
                    <v-text-field
                      label="Contraseña"
                      outlined
                      dense
                      color="blue"
                      autocomplete="false"
                      type="password"
                    />
                    <v-row>
                      <v-col cols="12" sm="7">
                        <v-checkbox
                          label="Remember Me"
                          class="mt-n1"
                          color="blue"
                        >
                        </v-checkbox>
                      </v-col>
                      <v-col cols="12" sm="5">
                        <span class="caption blue--text">Olvidé la Contraseña</span>
                      </v-col>
                    </v-row>
                    <v-btn color="blue" dark block tile>Iniciar Sesión</v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-col>
            
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      // Aquí se puede agregar la lógica de inicio de sesión
    },
  },
};
</script>


