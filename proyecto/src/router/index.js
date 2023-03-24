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
      title: "Dashboard"
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
      title: "Trigger"
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
          title: "Carpetas"
        },
      },
      {
        path: ':sociedad/:Folder',
        name:'subFolders',
        component: () => import(/* webpackChunkName: "about" */ '../views/SubFolders.vue'),
        meta: {
          title: "SubCarpetas"
        },
      }, 
      {
        path: ':sociedad/:Folder/:subFolder',
        name:'files',
        component: () => import(/* webpackChunkName: "about" */ '../views/Files.vue'),
        meta: {
          title: "Archivos"
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
      title: "Configuración"
    },
  },
]


const router = new VueRouter({
  routes
})


router.beforeEach((to,from,next)=>{
  document.title = `${to.meta.title}`;
  next();
})

export default router
