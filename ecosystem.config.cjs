module.exports = {
  apps: [{
    name: 'terp-pm-hub',
    script: './dist/index.js',
    cwd: '/home/ubuntu/TERP-PM-Hub',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'file:./.manus/db/sqlite.db',
      OAUTH_CLIENT_ID: 'manus-oauth',
      OAUTH_CLIENT_SECRET: 'test-secret',
      OAUTH_SERVER_URL: 'https://oauth.manus.com',
      OAUTH_REDIRECT_URI: 'https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer/api/oauth/callback',
      OWNER_OPEN_ID: 'test-owner',
      ENCRYPTION_KEY: '211f6183cc879fbc73c3ad9729001b117db1f40c1355247688b787248ab0d821',
      VITE_APP_TITLE: 'TERP PM Hub',
      VITE_APP_LOGO: 'https://placehold.co/128x128/4F46E5/FFFFFF?text=TERP',
      VITE_OAUTH_PORTAL_URL: 'https://oauth.manus.com',
      VITE_APP_ID: 'terp-pm-hub'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
