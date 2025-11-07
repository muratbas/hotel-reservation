# 📦 Hotel Reservation Admin - Installation Guide

Welcome! This guide will help you install and run the Hotel Reservation Admin application in just **10-15 minutes**.

---

## 🎯 Quick Overview

**What you need:**
1. Windows 10/11 computer
2. MySQL 8.0 or higher
3. This application package

**Total time:** ~10-15 minutes

---

## 📋 Step-by-Step Installation

### Step 1: Install MySQL (5-10 minutes)

If you don't have MySQL installed:

1. **Download MySQL Installer:**
   - Go to: https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows" (the larger one ~400MB is recommended)

2. **Run the Installer:**
   - Choose **"Custom"** installation type
   - Select these components:
     - ✅ MySQL Server 8.0
     - ✅ MySQL Workbench (optional, for database management)

3. **Configure MySQL Server:**
   - When asked for authentication method: Choose **"Use Strong Password Encryption"**
   - Set a **root password** (remember this! You'll need it in Step 2)
   - Default settings for everything else are fine

4. **Finish Installation:**
   - Click "Execute" and wait for installation to complete
   - Click "Finish"

**💡 Tip:** If you already have MySQL installed, skip to Step 2!

---

### Step 2: Run the Setup Script (30 seconds)

This script will automatically set up the database for you.

1. **Locate the files:**
   - Find the folder containing:
     - `setup.ps1`
     - `setup-database.sql`
     - `Hotel Reservation Admin.exe`

2. **Right-click on `setup.ps1`**
   - Select **"Run with PowerShell"**

   **If you see a security warning:**
   - Right-click `setup.ps1` → Properties
   - Check "Unblock" at the bottom → Click OK
   - Try running it again

3. **Enter MySQL password:**
   - The script will ask for your MySQL root password
   - Type it in (you won't see characters as you type - this is normal!)
   - Press Enter

4. **Wait for completion:**
   ```
   ✅ MySQL found
   🔧 Setting up hotel_reservation database...
   ✅ Database setup complete!
   
   🎉 Setup Successful!
   
   Login Credentials:
     📧 Email:    admin@hotel.com
     🔑 Password: admin123
   ```

---

### Step 3: Launch the Application (10 seconds)

1. **Double-click:** `Hotel Reservation Admin.exe`

2. **Login with default credentials:**
   - Email: `admin@hotel.com`
   - Password: `admin123`

3. **🎉 You're done!** The application is now ready to use.

---

## ⚠️ Important Security Note

**After your first login:**
1. Go to **Settings** (in the sidebar)
2. Add a new manager with your own credentials
3. Delete or change the default admin password!

---

## 🐛 Troubleshooting

### Problem: "MySQL not found"
**Solution:**
- Make sure MySQL is installed
- Restart your computer after MySQL installation
- Try running the setup script again

### Problem: "Access denied for user 'root'"
**Solution:**
- You entered the wrong MySQL password
- Run the setup script again and enter the correct password

### Problem: "Database already exists"
**Solution:**
- The database was already set up!
- You can skip to Step 3 and launch the app directly

### Problem: PowerShell script won't run
**Solution:**
- Right-click `setup.ps1` → Properties → Unblock → OK
- Or run PowerShell as Administrator and type:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

### Problem: Application won't start
**Solution:**
- Make sure MySQL service is running:
  - Open Services (Win + R, type `services.msc`)
  - Find "MySQL80" or "MySQL"
  - Click "Start" if it's not running

---

## 📞 Need Help?

If you're stuck:
1. Make sure MySQL service is running (check Services in Windows)
2. Try restarting your computer
3. Ask the person who gave you this app for help!

---

## 🎓 What's Included

After setup, you'll have:
- ✅ Hotel Reservation database (ready to use)
- ✅ Default admin account (admin@hotel.com / admin123)
- ✅ Sample rooms (optional - to see the system in action)
- ✅ Empty guest and reservation tables (ready for your data)

---

## 🚀 You're All Set!

The application is now installed and ready to use. You can:
- ✅ Manage hotel rooms
- ✅ Create reservations
- ✅ Track guests
- ✅ View dashboard analytics
- ✅ Export data to CSV
- ✅ Manage multiple admin accounts

**Enjoy using the Hotel Reservation Admin system!** 🏨

