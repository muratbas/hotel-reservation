# 📦 How to Share Your App with Friends

## 🎯 What to Send Your Friends

When you're ready to share your Hotel Reservation Admin app, send them these files:

### **Required Files:**

```
Hotel-Reservation-Package/
├── Hotel Reservation Admin Setup 1.0.0.exe  ← The installer
├── setup.ps1                                 ← Automated setup script
├── setup-database.sql                        ← Database creation script
├── SETUP_README.txt                          ← Quick start (read me first!)
└── INSTALLATION_GUIDE.md                     ← Detailed instructions
```

### **Where to Find These Files:**

After you run `npm run build:win`:

1. **The Installer:**
   - Location: `hotel-app/release/Hotel Reservation Admin Setup 1.0.0.exe`
   - This is the main app installer

2. **Setup Scripts (already created):**
   - `hotel-app/setup.ps1`
   - `hotel-app/setup-database.sql`
   - `hotel-app/SETUP_README.txt`
   - `hotel-app/INSTALLATION_GUIDE.md`

---

## 📋 What Your Friends Need to Do

### Simple Version (3 Steps):

1. **Install MySQL** (10 minutes, one-time)
2. **Run `setup.ps1`** (30 seconds, automatic!)
3. **Run the app!** (instant)

### Detailed Steps:

They should read `SETUP_README.txt` first, then follow `INSTALLATION_GUIDE.md` for detailed instructions.

**Total time for them: 10-15 minutes**

---

## 🎁 How to Package Everything

### Option 1: Zip File (Easiest)

1. Create a new folder called `Hotel-Reservation-Package`
2. Copy all 5 files listed above into it
3. Right-click the folder → Send to → Compressed (zipped) folder
4. Share the zip file!

### Option 2: Google Drive / OneDrive

1. Upload all 5 files to a cloud drive folder
2. Share the folder link with your friends

### Option 3: USB Drive

1. Copy all 5 files to a USB drive
2. Hand it to your friends!

---

## ⚠️ Important Notes

### For Your Friends:

1. **MySQL is required** - They must install it first
2. **Internet needed** - Only for downloading MySQL (one time)
3. **Windows only** - The app is built for Windows 10/11
4. **No coding needed** - Everything is automated!

### Default Credentials:

All installations will have the same default admin account:
- **Email:** admin@hotel.com  
- **Password:** admin123

**⚠️ Tell them to change this password immediately after first login!**

---

## 🔄 Updates

If you make changes and rebuild the app:

1. Run `npm run build:win` again
2. The new `.exe` will be in `release/` folder
3. Send the new `.exe` to friends
4. They can install over the old version (database is kept!)

---

## 🐛 If They Have Problems

Common issues and solutions are in `INSTALLATION_GUIDE.md`

Most common issue:
- **"MySQL not found"** → They forgot to install MySQL!

---

## ✅ Checklist for Distribution

Before sending to friends, make sure:

- [ ] You tested the setup.ps1 script yourself
- [ ] The .exe file is the latest version
- [ ] All 5 files are included
- [ ] You included INSTALLATION_GUIDE.md for troubleshooting

---

## 🎉 You're Ready!

Your friends will be up and running in 10-15 minutes max!

The setup script makes it super easy - they literally just:
1. Install MySQL (one time)
2. Run setup.ps1 (automatic!)
3. Launch the app!

**No complicated configuration, no editing files, no technical knowledge needed!** 🚀

