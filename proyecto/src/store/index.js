import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import decode from "jwt-decode";
import router from "../router";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: null,
    usuario: null,
    contenedores: [],
  },
  getters: {
    getContenedores: (state) => state.contenedores,
    isAuthenticated: (state) => !!state.usuario,
    getUsuario: (state) => state.usuario,
  },
  mutations: {
    SET_CONTENEDORES(state, contenedores) {
      state.contenedores = contenedores;
    },
    ADD_NEW(state, nuevo) {
      state.contenedores.push(nuevo);
    },
    DELETE_CONTENEDOR(state, elminado) {
      let index = state.contenedores.findIndex(
        (contenedor) => contenedor._id === elminado._id
      );
      state.contenedores.splice(index, 1);
    },
    EDIT_CONTENEDOR(state, newContainers) {
      state.contenedores = newContainers;
    },
    setToken(state, token) {
      state.token = token;
    },
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
  },
  actions: {
    async obtenerContenedores({ commit }) {
      try {
        await axios.get("/sociedad/getPadres").then((result) => {
          commit("SET_CONTENEDORES", result.data);
        });
      } catch (error) {
        console.log(error);
      }
    },
    cambiarContenedor({ commit }, nuevos) {
      commit("SET_CONTENEDORES", nuevos);
    },
    modificarContenedor({ commit }, editados) {
      commit("EDIT_CONTENEDOR", editados);
    },
    agregarContenedor({ commit }, nuevo) {
      commit("ADD_NEW", nuevo);
    },
    eliminarContenedor({ commit }, eliminado) {
      commit("DELETE_CONTENEDOR", eliminado);
    },
    guardarToken({ commit }, token) {
      commit("setToken", token);
      commit("setUsuario", decode(token));
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", decode(token));
    },
    redirigirAInicioSesion() {
      // Redirigir al usuario a la página de inicio de sesión
      router.push("/login");
    },
    async autoLogin({ commit, dispatch }) {
      let token = localStorage.getItem("token");
      if (token) {
        try {
          const token = localStorage.getItem("token");
          await axios.get("/usuario/verificarTokenValido", {
            headers: {
              Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
            },
          });
          commit("setToken", token);
          commit("setUsuario", decode(token));
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // El token ha expirado, borrarlo del almacenamiento local y redirigir al login
            commit("setToken", null);
            commit("setUsuario", null);
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            dispatch("redirigirAInicioSesion"); // Llamar a la acción para redirigir
          }
        }
      }
    },
    salir({ commit }) {
      commit("setToken", null);
      commit("setUsuario", null);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      router.push("/login");
    },
  },
  modules: {},
});
