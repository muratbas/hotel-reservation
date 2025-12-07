# 🚂 Railway.app MySQL Setup Guide

## ✅ What We Changed

Your hotel management system now connects to a **cloud-hosted MySQL database** on Railway.app instead of requiring local MySQL installation!

---

## 📝 Step-by-Step Instructions

### **Step 1: Get Your Railway Credentials**

1. Go to **https://railway.app/dashboard**
2. Click on your **MySQL service**
3. Click on the **"Connect"** tab
4. You'll see something like this:

```
MYSQLHOST=containers-us-west-123.railway.app
MYSQLPORT=6543
MYSQLUSER=root
MYSQLPASSWORD=abcd1234efgh5678
MYSQLDATABASE=railway
```

**Copy these values!** You'll need them in the next steps.

---

### **Step 2: Update Database Credentials in Code**

Open the file: `hotel-app/electron/main.ts`

Find this section (around line 11-22):

```typescript
const dbConfig = {
  host: 'YOUR_RAILWAY_HOST.railway.app',
  port: 6543,
  user: 'root',
  password: 'YOUR_RAILWAY_PASSWORD',
  database: 'railway'
};
```

**Replace with your actual Railway credentials:**

```typescript
const dbConfig = {
  host: 'containers-us-west-123.railway.app',  // Your MYSQLHOST
  port: 6543,                                    // Your MYSQLPORT
  user: 'root',                                  // Your MYSQLUSER
  password: 'abcd1234efgh5678',                  // Your MYSQLPASSWORD
  database: 'railway'                            // Your MYSQLDATABASE
};
```

---

### **Step 3: Set Up Database Tables on Railway**

You need to create the tables in your Railway database:

#### **Option A: Using Railway's Web Interface (Easiest)**

1. In Railway dashboard, click your **MySQL service**
2. Go to **"Data"** tab
3. You'll see a **"Query"** section at the top
4. Open the file `hotel-app/setup-database.sql`
5. **Copy the ENTIRE contents** of that file
6. **Paste** it into Railway's Query section
7. Click **"Run"** or press the play button ▶️
8. You should see success messages!

#### **Option B: Using MySQL Workbench**

1. Download **MySQL Workbench** (free)
2. Create new connection:
   - Hostname: Your MYSQLHOST
   - Port: Your MYSQLPORT  
   - Username: Your MYSQLUSER
   - Password: Your MYSQLPASSWORD
3. Connect
4. Open `setup-database.sql`
5. Execute the script

---

### **Step 4: Test Your App**

1. Open terminal in `hotel-app` folder
2. Run:
   ```bash
   npm run dev
   ```
3. Check the console output - you should see:
   ```
   ✅ Connected to MySQL database
   ```
4. Try logging in with:
   - **Email:** `admin@hotel.com`
   - **Password:** `admin123`

---

### **Step 5: Build for Distribution**

Once everything works, build your app:

```bash
cd hotel-app
npm run build
```

Your `.exe` file will now work on **ANY Windows PC** without MySQL installation! 🎉

---

## 🔧 Troubleshooting

### Problem: "Connection timeout" or "ECONNREFUSED"

**Solutions:**
1. Check if your Railway credentials are correct
2. Make sure your Railway service is running (not paused)
3. Check Railway dashboard for any service errors

### Problem: "Database not found"

**Solution:**
- Make sure you ran the `setup-database.sql` script on Railway
- Check that the `database` field in `dbConfig` matches your Railway database name

### Problem: "Tables don't exist"

**Solution:**
- You need to run the `setup-database.sql` script on Railway
- See Step 3 above

---

## 💰 Railway Free Tier Info

- **$5 free credit/month** (enough for small projects)
- **500MB storage** (plenty for hotel management)
- **100 hours uptime/month** on free tier

If you exceed limits, Railway has affordable paid plans.

---

## 🔒 Security Note

**For School Projects:** Hardcoded credentials are usually fine.

**For Production:** Consider using environment variables:
1. Create `.env` file (add to `.gitignore`)
2. Use `dotenv` package
3. Load credentials from environment

Let me know if you want help setting this up!

---

## ✅ Checklist

- [ ] Got Railway MySQL credentials
- [ ] Updated `electron/main.ts` with credentials
- [ ] Ran `setup-database.sql` on Railway
- [ ] Tested app locally (`npm run dev`)
- [ ] App connects successfully
- [ ] Can login with admin credentials
- [ ] Built final `.exe` file

---

## 🎯 What's Different Now?

**Before (Local MySQL):**
- ❌ Users need to install MySQL
- ❌ Complex setup process
- ❌ Only works on one computer
- ❌ Need to share database files

**After (Railway MySQL):**
- ✅ No MySQL installation needed
- ✅ Works on any PC instantly
- ✅ Centralized data
- ✅ Can access from multiple computers
- ✅ Always online and backed up

---

**Need help?** Check Railway's documentation or ask me! 🚀

