module.exports = {
  apps: [
    {
      name: 'flwbite-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      restart_delay: 4000,
      kill_timeout: 5000, // Time to wait before force kill
      listen_timeout: 3000, // Time to wait for app to listen
      shutdown_with_message: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
