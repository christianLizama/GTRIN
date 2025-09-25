require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "app",                
      script: "app.js",         
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        PORT_SERVER: process.env.PORT_SERVER || 3030,
        MONGO_URL: process.env.MONGO_URL,
        NODE_ENV: "development"
      },
      env_production: {
        PORT_SERVER: process.env.PORT_SERVER || 3030,
        MONGO_URL: process.env.MONGO_URL,
        NODE_ENV: "production"
      }
    }
  ]
};
