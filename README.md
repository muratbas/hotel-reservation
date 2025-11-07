# 🏨 Hotel Reservation Management System

> A modern, offline-first desktop application for managing hotel rooms, reservations, and guests. Built with Electron, React, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-38-47848f)](https://www.electronjs.org/)

## 📋 Overview

A comprehensive hotel management system designed for small to medium-sized hotels. Manage up to 200 rooms, track guest information, handle reservations, and monitor hotel operations—all without requiring an internet connection.

### ✨ Key Features

- 🎨 **Beautiful Dark-Themed UI** - Modern, responsive interface built with Tailwind CSS
- 🏠 **Visual Room Dashboard** - Color-coded status indicators (Available/Occupied/Maintenance)
- 👥 **Guest Management** - Complete guest profiles with reservation history
- 📅 **Reservation System** - Create, edit, and manage bookings with date conflict detection
- 🔐 **Secure Authentication** - Password-protected access with bcrypt encryption
- 📊 **Dashboard Analytics** - Occupancy rates, check-ins/outs, and booking trends
- 📤 **Data Export** - Export guests, rooms, and reservations to CSV
- 🖨️ **Invoice Printing** - Generate printable invoices for reservations
- 💾 **Offline-First** - Works completely offline with local MySQL database
- 🔄 **Transaction Safety** - All database operations protected with rollback capability

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20 or higher)
- **MySQL Server** (v8.0 or higher)
- **Windows 10/11** (cross-platform support: Mac/Linux)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/muratbas/hotel-reservation.git
   cd hotel-reservation/hotel-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   
   First, install MySQL if you haven't already. Then run:
   ```bash
   # Windows (PowerShell)
   .\setup.ps1
   
   # Or manually with MySQL client
   mysql -u root -p < setup-database.sql
   ```
   
   This creates:
   - Database: `hotel_reservation`
   - Tables: Rooms, Guests, Reservations, Managers
   - Default admin account (email: `admin@hotel.com`, password: `admin123`)

4. **Configure database connection**
   
   Edit `electron/main.ts` if needed:
   ```typescript
   const dbConfig = {
     host: 'localhost',
     port: 3306,
     user: 'root',
     password: 'YOUR_PASSWORD',
     database: 'hotel_reservation'
   };
   ```

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Build for production
   npm run build
   ```

### 🔑 Default Login Credentials

- **Email:** `admin@hotel.com`
- **Password:** `admin123`

⚠️ **Important:** Change the default password immediately after first login!

## 🛠️ Tech Stack

### Core Technologies
- **Electron** - Cross-platform desktop framework
- **React 18** - UI library with functional components and hooks
- **TypeScript 5** - Type-safe development
- **Vite** - Lightning-fast build tool with HMR
- **MySQL 8** - Reliable relational database
- **Tailwind CSS** - Utility-first styling

### Key Libraries
- `mysql2` - MySQL database driver
- `bcryptjs` - Password hashing
- `electron-builder` - Package and distribute the app
- `xlsx` - Excel export functionality

## 📁 Project Structure

```
hotel-app/
├── electron/               # Electron main process
│   ├── main.ts            # App entry point & IPC handlers
│   └── preload.ts         # Secure IPC bridge
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   └── App.tsx           # Root React component
├── public/               # Static assets
├── setup-database.sql    # Database initialization script
├── setup.ps1            # Automated setup script
└── package.json         # Dependencies and scripts
```

## 📚 Features Documentation

### Room Management
- **Visual Grid Layout** - View all rooms organized by floor
- **Status Filtering** - Filter by Available, Occupied, or Maintenance
- **Quick Actions** - Click any room to view details or manage reservations
- **Bulk Operations** - Add or remove multiple rooms at once

### Guest Management
- **Guest Profiles** - Store contact information and preferences
- **Reservation History** - Track all past and current stays
- **Search & Filter** - Find guests quickly by name, phone, or email
- **Statistics** - View total stays, revenue, and last visit date

### Reservations
- **Date Conflict Detection** - Automatically prevents double bookings
- **Guest Association** - Link to existing guests or create new profiles
- **Check-in/Check-out** - One-click status updates
- **Staff Notes** - Add internal notes for each reservation

### Dashboard Analytics
- **Occupancy Rate** - Real-time hotel capacity monitoring
- **Today's Activity** - Check-ins and check-outs for the day
- **Booking Trends** - Visual chart with time filters (today/7 days/30 days)
- **Upcoming Events** - Manage hotel events and reminders

### Security
- **Password Protection** - Bcrypt-encrypted passwords
- **Session Management** - Persistent login sessions
- **Manager Accounts** - Add/remove staff access
- **Protected Routes** - Automatic redirect to login when unauthorized

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Build for Windows (creates installer)
npm run build:win

# Lint code
npm run lint
```

### Database Schema

The application uses four main tables:

**Rooms**
- RoomId, RoomNumber, Type, Status, FloorNumber, PricePerNight, MaxGuests

**Guests**
- GuestId, FullName, PhoneNumber, Email, Gender, CreatedAt

**Reservations**
- ReservationId, RoomId, GuestId, CheckInDate, CheckOutDate, NumberOfGuests, Status, StaffNotes

**Managers**
- ManagerId, Email, PasswordHash, FullName, CreatedAt, LastLoginAt

## 📦 Building for Distribution

### Create Windows Installer

```bash
npm run build
```

This creates:
- `release/Hotel Reservation Admin Setup.exe` - Windows installer
- `release/win-unpacked/` - Portable version

### Sharing with Others

1. **Share the installer** (recommended)
   - Send `Hotel Reservation Admin Setup.exe`
   - Include `setup-database.sql` and `INSTALLATION_GUIDE.md`

2. **Or share the portable version**
   - Zip the `win-unpacked` folder
   - User can run directly without installation

3. **Database Setup for Others**
   - They need MySQL installed locally
   - Run the provided `setup.ps1` script
   - Or manually import `setup-database.sql`

## 🤝 Contributing

This is a student project for learning purposes. Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

### Completed ✅
- [x] Room management dashboard
- [x] Guest profiles and search
- [x] Reservation system with conflict detection
- [x] Authentication and user management
- [x] Dashboard analytics
- [x] CSV exports and invoice printing

### Planned 🔜
- [ ] Advanced calendar view
- [ ] Payment tracking
- [ ] Housekeeping management
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## ⚠️ Known Limitations

- Maximum 200 rooms per hotel
- Single-property management only
- Requires local MySQL installation
- No cloud synchronization

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Database not connected
```
**Solution:** Ensure MySQL service is running. On Windows:
1. Open Services (`services.msc`)
2. Find "MySQL80" service
3. Right-click → Start

### Port Already in Use
```
Error: Port 3306 is already in use
```
**Solution:** Another MySQL instance is running. Stop it or change the port in `electron/main.ts`.

### Build Errors
```
Error: Cannot find module 'electron'
```
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Murat Baş**
- GitHub: [@muratbas](https://github.com/muratbas)

## 🙏 Acknowledgments

- Built as a learning project
- Inspired by real hotel management needs
- Thanks to the open-source community

---

**⭐ If you find this project helpful, please consider giving it a star!**
