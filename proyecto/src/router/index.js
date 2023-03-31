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
      logged:true,
      isAdmin:true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/login.vue'),
    meta: {
      title: "login",
      guest: true
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
      logged:true,
      isAdmin:true
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
          logged:true,
          isAdmin:true
        },
      },
      {
        path: ':sociedad/:Folder',
        name:'subFolders',
        component: () => import(/* webpackChunkName: "about" */ '../views/SubFolders.vue'),
        meta: {
          title: "SubCarpetas",
          logged:true,
          isAdmin:true
        },
      }, 
      {
        path: ':sociedad/:Folder/:subFolder',
        name:'files',
        component: () => import(/* webpackChunkName: "about" */ '../views/Files.vue'),
        meta: {
          title: "Archivos",
          logged:true,
          isAdmin:true
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
      logged:true,
      isAdmin:true
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

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.guest)) {
    var loggedIn = localStorage.getItem('token')
    if (loggedIn) {
      next("/");
      return;
    }
    else{
      next();
    }
  } else {
    next();
  }
});

import decode from 'jwt-decode'
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.isAdmin)) {
    var user = localStorage.getItem('token')
    if(user!=null){
      var user2 = decode(user)
    }
    else{
      next("/login");
      return;
    }
    
    if (user2.rol != 'admin') {
      next("/login");
      return;
    }
    else{
      next();
    }
  } else {
    next();
  }
});

export default router
