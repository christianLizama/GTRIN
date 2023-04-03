import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: "Dashboard",
      admin:true,
      usuario:true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/login.vue'),
    meta: {
      title: "login",
      libre: true,
    }
  },
  {
    path: '/triggers',
    name: 'triggers',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Triggers.vue'),
    meta: {
      title: "Trigger",
      admin: true,
    }
  },
  {
    path: '/archivos',
    name: 'archivos',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Archivos.vue'),
    children: [
      {
        path: ':id',
        name:'folder',
        component: () => import(/* webpackChunkName: "about" */ '../views/Folder.vue'),
        meta: {
          title: "Carpetas",
          admin: true,
          usuario: true,
        },
      },
      {
        path: ':sociedad/:Folder',
        name:'subFolders',
        component: () => import(/* webpackChunkName: "about" */ '../views/SubFolders.vue'),
        meta: {
          title: "SubCarpetas",
          admin: true,
          usuario: true,
        },
      }, 
      {
        path: ':sociedad/:Folder/:subFolder',
        name:'files',
        component: () => import(/* webpackChunkName: "about" */ '../views/Files.vue'),
        meta: {
          title: "Archivos",
          admin: true,
          usuario: true,
        },
      }
    ]
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Configuracion.vue'),
    meta: {
      title: "Configuración",
      admin: true
    },
  },
  {
    path: '/adminCrud',
    name: 'admincrud',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Admin.vue'),
    meta: {
      title: "admincrud",
      admin: true
    },
  },
  {
    path: '/recuperarClave',
    name: 'recuperar',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/RecuperClave.vue'),
    meta: {
      title: "recuperar",
      libre: true,
    },
  },
]


const router = new VueRouter({
  routes,
  mode: 'history',
})


router.beforeEach((to,from,next)=>{
  document.title = `${to.meta.title}`;
  next();
})

import decode from 'jwt-decode'
router.beforeEach((to, from, next) => {
  let user = localStorage.getItem('token')
  if(user){
    var usuario = decode(user)
  }
  if(to.meta.libre){
    next()
  }
  else if(usuario && usuario.rol == "admin"){
    if(to.meta.admin){
      next();
    }
  }else if(usuario && usuario.rol == "usuario"){
    if(to.meta.usuario){
      next();
    }
  }
  else{
    next("/login")
  }

})


export default router
