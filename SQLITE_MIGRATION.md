# SQLite Migration Guide

## What Changed?

✅ **Successfully migrated from MySQL to SQLite!**

Your hotel reservation app now uses **SQLite** instead of MySQL, which means:
- ✅ **No MySQL installation needed** for your friends!
- ✅ **Database file included** with the app
- ✅ **Works out of the box** - just run the .exe!
- ✅ **Each person gets their own database**

## Files Changed

### New Files:
- `electron/database.ts` - SQLite database helper functions
- `electron/seed-database.ts` - Creates default admin account

### Modified Files:
- `electron/main.ts` - Now uses SQLite instead of MySQL
- `package.json` - Replaced `mysql2` with `sql.js`

### Deleted (eventually):
- All MySQL-related dependencies will be removed

## Database Location

The SQLite database file is stored at:
```
%APPDATA%/hotel-reservation-admin/hotel-reservation.db
```

On Windows, this is typically:
```
C:\Users\YourName\AppData\Roaming\hotel-reservation-admin\hotel-reservation.db
```

## Default Admin Account

When you first run the app, it automatically creates an admin account:

- **Email**: `admin@hotel.com`
- **Password**: `admin123`

⚠️ **Please change this password after first login!**

## Key Differences (Technical)

### MySQL → SQLite Query Changes:

1. **Date Functions**:
   - `NOW()` → `datetime('now')`
   - `CURDATE()` → `date('now')`
   - `DATE_SUB(CURDATE(), INTERVAL 7 DAY)` → `date('now', '-7 days')`

2. **Date Differences**:
   - `DATEDIFF(checkout, checkin)` → `julianday(checkout) - julianday(checkin)`

3. **Auto Increment**:
   - MySQL: `insertId`
   - SQLite: `lastInsertRowid`

4. **Transaction Handling**:
   - SQLite auto-saves after each operation
   - No explicit `BEGIN TRANSACTION` needed for simple operations

## Testing Checklist

Test these features to ensure everything works:

- [ ] Login with admin@hotel.com / admin123
- [ ] View rooms dashboard
- [ ] Create a new reservation
- [ ] Check out a guest
- [ ] Add new rooms
- [ ] View guests page
- [ ] Export to CSV
- [ ] Add a new manager
- [ ] View dashboard statistics

## Distributing the App

When you build the `.exe`:

```bash
npm run build:win
```

The installer will include:
1. ✅ Your app code
2. ✅ SQLite WASM file (for database operations)
3. ✅ All dependencies

**What your friends need to do:**
1. Download the installer (`Hotel Reservation Admin Setup 1.0.0.exe`)
2. Run the installer
3. Launch the app
4. Login with default credentials
5. **That's it!** No MySQL setup needed!

## Troubleshooting

### "Database not connected" error
- The app should automatically create the database on first run
- Check the console for error messages

### Cannot login
- Use default credentials: admin@hotel.com / admin123
- Check if database file exists in AppData folder

### Performance
- SQLite is actually **faster** for single-user desktop apps!
- No network overhead like MySQL

## Reverting to MySQL (if needed)

If you need to go back to MySQL:
1. Restore the old `main.ts` from git history
2. Run `npm install mysql2`
3. Update `package.json` to use mysql2 instead of sql.js
4. Rebuild the app

## Next Steps

The app is now ready to distribute! Your friends won't need any database setup. 🎉

If you want to include sample data (rooms, guests), you can:
1. Run the app once to create the database
2. Add sample data through the UI
3. Find the database file in AppData
4. Include it with the app (advanced)

Or just let each user start fresh and add their own data!

