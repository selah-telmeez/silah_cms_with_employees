# سلاح التلميذ — نظام إدارة إنتاج الكتب
## Full-Stack CMS — React + Express + SQLite

---

## 📁 Project Structure

```
silah-cms/
├── server/
│   ├── index.js              ← Express server entry point
│   ├── middleware/
│   │   └── auth.js           ← JWT authentication middleware
│   └── routes/
│       ├── auth.js           ← Login / me / change password
│       ├── tasks.js          ← Full CRUD for tasks
│       ├── members.js        ← Team members CRUD
│       ├── phases.js         ← Phases + progress update
│       ├── gates.js          ← Quality gates
│       ├── activity.js       ← Activity feed
│       └── dashboard.js      ← Dashboard summary
├── database/
│   ├── init.js               ← Creates tables + seeds data
│   ├── db.js                 ← SQLite singleton connection
│   └── silah_cms.db          ← Auto-created on first run
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js          ← React entry point
│       ├── App.jsx           ← Root app + API wiring
│       ├── api.js            ← All API calls (axios)
│       ├── context/
│       │   └── AuthContext.js← Login state management
│       ├── pages/
│       │   └── Login.jsx     ← Login screen
│       └── components/
│           └── CMS.jsx       ← Main CMS UI (your component)
├── uploads/                  ← File upload directory
├── .env                      ← Environment variables
├── package.json              ← Root (server) dependencies
└── README.md
```

---

## 🚀 Quick Start (Development)

### Step 1 — Install everything
```bash
npm run setup
```
This installs server + client dependencies AND creates the database.

### Step 2 — Start both servers
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Step 3 — Add your CMS component
Open `client/src/components/CMS.jsx` and follow the instructions inside to paste your `Content_Management_System.jsx` code.

---

## 🔑 Login Credentials

| Username  | Password     | Role        |
|-----------|-------------|-------------|
| admin     | admin123    | Admin       |
| sara      | sara123     | Editor      |
| mohamed   | mohamed123  | Author      |
| nourhan   | nourhan123  | Author      |
| karim     | karim123    | Reviewer    |
| heba      | heba123     | Reviewer    |
| amr       | amr123      | Designer    |
| reem      | reem123     | Coordinator |

---

## 🌐 Deployment on a Server (VPS / cPanel)

### Option A — VPS (Ubuntu/Debian) with PM2

```bash
# 1. Upload files to server
scp -r silah-cms/ user@yourserver.com:/var/www/

# 2. SSH into server
ssh user@yourserver.com
cd /var/www/silah-cms

# 3. Setup
npm run setup

# 4. Build React for production
npm run build

# 5. Set production env
echo "NODE_ENV=production" >> .env
echo "PORT=5000" >> .env
echo "JWT_SECRET=your_very_long_random_secret_here" >> .env

# 6. Install PM2 and start
npm install -g pm2
pm2 start server/index.js --name silah-cms
pm2 save
pm2 startup

# 7. Nginx config (reverse proxy)
sudo nano /etc/nginx/sites-available/silah-cms
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/silah-cms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option B — cPanel Shared Hosting (Node.js App)

1. Log into cPanel → **Setup Node.js App**
2. Create new app:
   - Node.js version: 18+
   - Application root: `silah-cms`
   - Application URL: your domain
   - Application startup file: `server/index.js`
3. Upload all files via File Manager
4. In terminal: `npm run setup`
5. Set environment variables in cPanel Node.js app settings
6. Click **Run NPM Install** then **Start**

### Option C — Railway / Render (Free cloud)

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render:**
- Connect GitHub repo
- Build command: `npm run setup && npm run build`
- Start command: `npm start`
- Add env variables in dashboard

---

## 📡 API Endpoints

| Method | Endpoint                  | Auth      | Description              |
|--------|---------------------------|-----------|--------------------------|
| POST   | /api/auth/login           | Public    | Login                    |
| GET    | /api/auth/me              | Any       | Current user             |
| PUT    | /api/auth/password        | Any       | Change password          |
| GET    | /api/dashboard/summary    | Any       | Dashboard data           |
| GET    | /api/tasks                | Any       | List tasks (filterable)  |
| POST   | /api/tasks                | Editor+   | Create task              |
| PUT    | /api/tasks/:id            | Any       | Update task              |
| DELETE | /api/tasks/:id            | Editor+   | Delete task              |
| GET    | /api/members              | Any       | List members             |
| POST   | /api/members              | Admin     | Add member               |
| GET    | /api/phases               | Any       | List phases + progress   |
| PUT    | /api/phases/:id/progress  | Any       | Update phase progress    |
| GET    | /api/gates                | Any       | Quality gates            |
| PUT    | /api/gates/:id            | Editor+   | Update gate status       |
| GET    | /api/activity             | Any       | Activity feed            |
| POST   | /api/activity             | Any       | Add activity entry       |

---

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
DB_PATH=./database/silah_cms.db
CLIENT_URL=https://yourdomain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## 🗄️ Reset Database

```bash
rm database/silah_cms.db
npm run db:init
```

---

## 📞 Support

For issues, contact: dev@silah.com
