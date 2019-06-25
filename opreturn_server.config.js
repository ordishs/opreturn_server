module.exports = {
  apps: [
    {
      name: 'opreturn_server',
      script: './main.js',
      instances: 1,
      exec_mode: 'fork',
      kill_timeout: 10000,
      error_file: '../shared/logs/opreturn_server.log',
      out_file: '../shared/logs/opreturn_server.log',
      merge_logs: true
    }
  ]
}
