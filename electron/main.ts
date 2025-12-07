import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// DATABASE CONFIGURATION - RAILWAY.APP
// ============================================
// Replace these with your actual Railway MySQL credentials:
// 1. Go to Railway.app dashboard
// 2. Click on your MySQL service
// 3. Go to "Connect" tab
// 4. Copy and paste your credentials below

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',                // Railway public host
  port: 28816,                                    // Railway MySQL port
  user: 'root',                                   // Railway user
  password: 'vXJaPghAVijvAiJyfeYGaYTNFWCODuCM',  // Railway password
  database: 'railway',                            // Railway database name
  charset: 'utf8mb4'                              // UTF-8 encoding for Turkish characters (ö, ü, ğ, ş, etc.)
};

let mainWindow: BrowserWindow | null = null;
let dbConnection: mysql.Connection | null = null;

// Create database connection
async function createDatabaseConnection() {
  try {
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#101922',
    frame: false, // Remove default title bar
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await createDatabaseConnection();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (dbConnection) {
      dbConnection.end();
    }
    app.quit();
  }
});

// IPC Handlers for database operations

// Get all rooms
ipcMain.handle('db:get-rooms', async () => {
  if (!dbConnection) throw new Error('Database not connected');
  const [rows] = await dbConnection.execute('SELECT * FROM Rooms ORDER BY RoomNumber');
  return rows;
});

// Get room by ID
ipcMain.handle('db:get-room', async (_event, roomId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  const [rows] = await dbConnection.execute('SELECT * FROM Rooms WHERE RoomId = ?', [roomId]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});

// Get all guests
ipcMain.handle('db:get-guests', async () => {
  if (!dbConnection) throw new Error('Database not connected');
  const [rows] = await dbConnection.execute('SELECT * FROM Guests ORDER BY CreatedAt DESC');
  return rows;
});

// Get all reservations with details
ipcMain.handle('db:get-reservations', async () => {
  if (!dbConnection) throw new Error('Database not connected');
  const query = `
    SELECT 
      r.*, 
      rm.RoomNumber, 
      rm.Type as RoomType,
      g.FullName as GuestName,
      g.PhoneNumber,
      g.Email,
      g.Gender
    FROM Reservations r
    JOIN Rooms rm ON r.RoomId = rm.RoomId
    JOIN Guests g ON r.GuestId = g.GuestId
    WHERE r.Status = 'Active'
    ORDER BY r.CheckInDate DESC
  `;
  const [rows] = await dbConnection.execute(query);
  return rows;
});

// Get reservation by room ID
ipcMain.handle('db:get-room-reservation', async (_event, roomId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  const query = `
    SELECT 
      r.*, 
      g.FullName as GuestName,
      g.PhoneNumber,
      g.Email,
      g.Gender
    FROM Reservations r
    JOIN Guests g ON r.GuestId = g.GuestId
    WHERE r.RoomId = ? AND r.Status = 'Active'
    ORDER BY r.CheckInDate DESC
    LIMIT 1
  `;
  
  const [rows] = await dbConnection.execute(query, [roomId]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});

// Test database connection
ipcMain.handle('db:test-connection', async () => {
  try {
    if (!dbConnection) {
      await createDatabaseConnection();
    }
    await dbConnection!.ping();
    return { success: true, message: 'Database connected!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Check for date conflicts
ipcMain.handle('db:check-date-conflict', async (_event, roomId: number, checkInDate: string, checkOutDate: string) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  const query = `
    SELECT COUNT(*) as count
    FROM Reservations
    WHERE RoomId = ? 
      AND Status = 'Active'
      AND (
        (CheckInDate <= ? AND CheckOutDate >= ?) OR
        (CheckInDate <= ? AND CheckOutDate >= ?) OR
        (CheckInDate >= ? AND CheckOutDate <= ?)
      )
  `;
  
  const [rows]: any = await dbConnection.execute(query, [
    roomId,
    checkOutDate, checkInDate,
    checkInDate, checkInDate,
    checkInDate, checkOutDate
  ]);
  
  return rows[0].count > 0;
});

// Create new reservation
ipcMain.handle('db:create-reservation', async (_event, data: any) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    await dbConnection.beginTransaction();

    let guestId = data.guestId;

    // Create new guest if needed
    if (data.isNewGuest) {
      const insertGuest = `
        INSERT INTO Guests (FullName, PhoneNumber, Email, Gender, CreatedAt)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [result]: any = await dbConnection.execute(insertGuest, [
        data.guestName,
        data.guestPhone,
        data.guestEmail,
        data.guestGender
      ]);
      guestId = result.insertId;
    }

    // Create reservation
    const insertReservation = `
      INSERT INTO Reservations (
        RoomId, GuestId, CheckInDate, CheckOutDate, 
        NumberOfGuests, StaffNotes, Status, CreatedAt, CreatedByManagerId
      ) VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW(), 1)
    `;
    await dbConnection.execute(insertReservation, [
      data.roomId,
      guestId,
      data.checkInDate,
      data.checkOutDate,
      data.numberOfGuests,
      data.staffNotes
    ]);

    // Update room status to Occupied
    await dbConnection.execute(
      'UPDATE Rooms SET Status = ? WHERE RoomId = ?',
      ['Occupied', data.roomId]
    );

    await dbConnection.commit();
    return { success: true, message: 'Reservation created successfully' };
  } catch (error: any) {
    await dbConnection.rollback();
    console.error('Failed to create reservation:', error);
    return { success: false, message: error.message };
  }
});

// Check-out a reservation
ipcMain.handle('db:checkout-reservation', async (_event, roomId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    await dbConnection.beginTransaction();

    // Update reservation status
    await dbConnection.execute(
      `UPDATE Reservations 
       SET Status = 'CheckedOut' 
       WHERE RoomId = ? AND Status = 'Active'`,
      [roomId]
    );

    // Update room status to Available
    await dbConnection.execute(
      'UPDATE Rooms SET Status = ? WHERE RoomId = ?',
      ['Available', roomId]
    );

    await dbConnection.commit();
    return { success: true, message: 'Check-out completed successfully' };
  } catch (error: any) {
    await dbConnection.rollback();
    console.error('Failed to check-out:', error);
    return { success: false, message: error.message };
  }
});

// Update reservation
ipcMain.handle('db:update-reservation', async (_event, reservationId: number, data: any) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    const updateReservation = `
      UPDATE Reservations 
      SET CheckInDate = ?, 
          CheckOutDate = ?, 
          NumberOfGuests = ?, 
          StaffNotes = ?
      WHERE ReservationId = ?
    `;
    await dbConnection.execute(updateReservation, [
      data.checkInDate,
      data.checkOutDate,
      data.numberOfGuests,
      data.staffNotes,
      reservationId
    ]);

    return { success: true, message: 'Reservation updated successfully' };
  } catch (error: any) {
    console.error('Failed to update reservation:', error);
    return { success: false, message: error.message };
  }
});

// Add rooms (bulk)
ipcMain.handle('db:add-rooms', async (_event, roomsData: any[]) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    await dbConnection.beginTransaction();

    for (const room of roomsData) {
      const insertRoom = `
        INSERT INTO Rooms (RoomNumber, Type, Status, FloorNumber, PricePerNight, MaxGuests, CreatedAt)
        VALUES (?, ?, 'Available', ?, ?, ?, NOW())
      `;
      await dbConnection.execute(insertRoom, [
        room.roomNumber,
        room.type,
        room.floorNumber,
        room.pricePerNight,
        room.maxGuests
      ]);
    }

    await dbConnection.commit();
    return { success: true, message: `Successfully added ${roomsData.length} room(s)` };
  } catch (error: any) {
    await dbConnection.rollback();
    console.error('Failed to add rooms:', error);
    return { success: false, message: error.message };
  }
});

// Remove rooms (bulk)
ipcMain.handle('db:remove-rooms', async (_event, roomIds: number[]) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    await dbConnection.beginTransaction();

    // Check if any rooms are occupied
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM Rooms
      WHERE RoomId IN (${roomIds.join(',')}) AND Status = 'Occupied'
    `;
    const [checkResult]: any = await dbConnection.execute(checkQuery);
    
    if (checkResult[0].count > 0) {
      throw new Error('Cannot remove occupied rooms. Please check out guests first.');
    }

    // Delete rooms
    const deleteQuery = `DELETE FROM Rooms WHERE RoomId IN (${roomIds.join(',')})`;
    await dbConnection.execute(deleteQuery);

    await dbConnection.commit();
    return { success: true, message: `Successfully removed ${roomIds.length} room(s)` };
  } catch (error: any) {
    await dbConnection.rollback();
    console.error('Failed to remove rooms:', error);
    return { success: false, message: error.message };
  }
});

// Get all guests with statistics
ipcMain.handle('db:get-guests-with-stats', async () => {
  if (!dbConnection) throw new Error('Database not connected');
  
  const query = `
    SELECT 
      g.*,
      COUNT(DISTINCT r.ReservationId) as TotalStays,
      COALESCE(SUM(
        DATEDIFF(r.CheckOutDate, r.CheckInDate) * rm.PricePerNight
      ), 0) as TotalRevenue,
      MAX(r.CheckOutDate) as LastStayDate
    FROM Guests g
    LEFT JOIN Reservations r ON g.GuestId = r.GuestId
    LEFT JOIN Rooms rm ON r.RoomId = rm.RoomId
    GROUP BY g.GuestId
    ORDER BY g.CreatedAt DESC
  `;
  
  const [rows] = await dbConnection.execute(query);
  return rows;
});

// Get guest reservations
ipcMain.handle('db:get-guest-reservations', async (_event, guestId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  const query = `
    SELECT 
      r.*,
      rm.RoomNumber,
      rm.Type as RoomType,
      rm.PricePerNight
    FROM Reservations r
    JOIN Rooms rm ON r.RoomId = rm.RoomId
    WHERE r.GuestId = ?
    ORDER BY r.CheckInDate DESC
  `;
  
  const [rows] = await dbConnection.execute(query, [guestId]);
  return rows;
});

// Update guest information
ipcMain.handle('db:update-guest', async (_event, guestId: number, data: any) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    const updateGuest = `
      UPDATE Guests 
      SET FullName = ?, 
          PhoneNumber = ?, 
          Email = ?
      WHERE GuestId = ?
    `;
    await dbConnection.execute(updateGuest, [
      data.fullName,
      data.phoneNumber,
      data.email,
      guestId
    ]);

    return { success: true, message: 'Guest updated successfully' };
  } catch (error: any) {
    console.error('Failed to update guest:', error);
    return { success: false, message: error.message };
  }
});

// Update room status
ipcMain.handle('db:update-room-status', async (_event, roomId: number, status: string) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    const updateRoom = `UPDATE Rooms SET Status = ? WHERE RoomId = ?`;
    await dbConnection.execute(updateRoom, [status, roomId]);

    return { success: true, message: `Room status updated to ${status}` };
  } catch (error: any) {
    console.error('Failed to update room status:', error);
    return { success: false, message: error.message };
  }
});

// Export data to CSV
ipcMain.handle('db:export-csv', async (_event, type: string) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    let query = '';
    let filename = '';

    if (type === 'guests') {
      query = `
        SELECT 
          g.GuestId, g.FullName, g.PhoneNumber, g.Email, g.CreatedAt,
          COUNT(DISTINCT r.ReservationId) as TotalStays,
          COALESCE(SUM(DATEDIFF(r.CheckOutDate, r.CheckInDate) * rm.PricePerNight), 0) as TotalRevenue
        FROM Guests g
        LEFT JOIN Reservations r ON g.GuestId = r.GuestId
        LEFT JOIN Rooms rm ON r.RoomId = rm.RoomId
        GROUP BY g.GuestId
      `;
      filename = `guests_export_${Date.now()}.csv`;
    } else if (type === 'reservations') {
      query = `
        SELECT 
          r.ReservationId, r.CheckInDate, r.CheckOutDate, r.NumberOfGuests,
          r.Status, r.StaffNotes, r.CreatedAt,
          g.FullName as GuestName, g.PhoneNumber, g.Email, g.Gender,
          rm.RoomNumber, rm.Type as RoomType, rm.PricePerNight
        FROM Reservations r
        JOIN Guests g ON r.GuestId = g.GuestId
        JOIN Rooms rm ON r.RoomId = rm.RoomId
        ORDER BY r.CheckInDate DESC
      `;
      filename = `reservations_export_${Date.now()}.csv`;
    } else if (type === 'rooms') {
      query = `SELECT * FROM Rooms ORDER BY RoomNumber`;
      filename = `rooms_export_${Date.now()}.csv`;
    }

    const [rows]: any = await dbConnection.execute(query);
    return { success: true, data: rows, filename };
  } catch (error: any) {
    console.error('Failed to export data:', error);
    return { success: false, message: error.message };
  }
});

// ===== AUTHENTICATION HANDLERS =====

// Login manager
ipcMain.handle('auth:login', async (_event, email: string, password: string) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    console.log('🔐 Login attempt for:', email);
    const query = `SELECT * FROM Managers WHERE Email = ?`;
    const [rows]: any = await dbConnection.execute(query, [email]);
    
    console.log('📊 Found managers:', rows.length);
    
    if (rows.length === 0) {
      console.log('❌ No manager found with this email');
      return { success: false, message: 'Invalid email or password' };
    }
    
    const manager = rows[0];
    console.log('👤 Manager found:', manager.FullName);
    console.log('🔑 Password hash from DB:', manager.PasswordHash.substring(0, 20) + '...');
    console.log('🔑 Password provided:', password);
    
    const isValid = await bcrypt.compare(password, manager.PasswordHash);
    console.log('✅ Password valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Password comparison failed');
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Update last login time
    await dbConnection.execute(
      `UPDATE Managers SET LastLoginAt = NOW() WHERE ManagerId = ?`,
      [manager.ManagerId]
    );
    
    console.log('✅ Login successful!');
    
    // Return manager without password hash
    const { PasswordHash, ...managerData } = manager;
    return { success: true, manager: managerData };
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return { success: false, message: error.message };
  }
});

// Get current manager (for session persistence)
ipcMain.handle('auth:get-current-manager', async (_event, managerId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    const query = `SELECT ManagerId, Email, FullName, Role, CreatedAt, LastLoginAt FROM Managers WHERE ManagerId = ?`;
    const [rows]: any = await dbConnection.execute(query, [managerId]);
    
    if (rows.length === 0) {
      return { success: false, message: 'Manager not found' };
    }
    
    return { success: true, manager: rows[0] };
  } catch (error: any) {
    console.error('Get current manager error:', error);
    return { success: false, message: error.message };
  }
});

// Get all managers
ipcMain.handle('auth:get-managers', async () => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    const query = `SELECT ManagerId, Email, FullName, Role, CreatedAt, LastLoginAt FROM Managers ORDER BY CreatedAt DESC`;
    const [rows]: any = await dbConnection.execute(query);
    return { success: true, managers: rows };
  } catch (error: any) {
    console.error('Get managers error:', error);
    return { success: false, message: error.message };
  }
});

// Create new manager
ipcMain.handle('auth:create-manager', async (_event, email: string, password: string, fullName: string, role: string = 'Personel') => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    // Check if email already exists
    const [existing]: any = await dbConnection.execute(
      `SELECT Email FROM Managers WHERE Email = ?`,
      [email]
    );
    
    if (existing.length > 0) {
      return { success: false, message: 'Email already exists' };
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert new manager with role
    const query = `INSERT INTO Managers (Email, PasswordHash, FullName, Role, CreatedAt) VALUES (?, ?, ?, ?, NOW())`;
    const [result]: any = await dbConnection.execute(query, [email, passwordHash, fullName, role]);
    
    return { success: true, managerId: result.insertId };
  } catch (error: any) {
    console.error('Create manager error:', error);
    return { success: false, message: error.message };
  }
});

// Delete manager
ipcMain.handle('auth:delete-manager', async (_event, managerId: number, currentManagerId: number) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    // Prevent self-deletion
    if (managerId === currentManagerId) {
      return { success: false, message: 'Cannot delete your own account' };
    }
    
    // Check if this is the last manager
    const [managers]: any = await dbConnection.execute(`SELECT COUNT(*) as count FROM Managers`);
    if (managers[0].count <= 1) {
      return { success: false, message: 'Cannot delete the last manager' };
    }
    
    // Delete manager
    const query = `DELETE FROM Managers WHERE ManagerId = ?`;
    await dbConnection.execute(query, [managerId]);
    
    return { success: true, message: 'Manager deleted successfully' };
  } catch (error: any) {
    console.error('Delete manager error:', error);
    return { success: false, message: error.message };
  }
});

// Get dashboard statistics
ipcMain.handle('db:get-dashboard-stats', async (_event, timeFilter: string) => {
  if (!dbConnection) throw new Error('Database not connected');
  
  try {
    console.log('📊 Getting dashboard stats for filter:', timeFilter);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate occupancy rate
    const [occupancyRows]: any = await dbConnection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'Occupied' THEN 1 ELSE 0 END) as occupied
      FROM Rooms
    `);
    const occupancyRate = Math.round((occupancyRows[0].occupied / occupancyRows[0].total) * 100) || 0;
    
    // Today's check-ins
    const [checkInsRows]: any = await dbConnection.execute(`
      SELECT COUNT(*) as count FROM Reservations 
      WHERE DATE(CheckInDate) = ? AND Status = 'Active'
    `, [today]);
    const todayCheckIns = checkInsRows[0].count;
    
    // Today's check-outs
    const [checkOutsRows]: any = await dbConnection.execute(`
      SELECT COUNT(*) as count FROM Reservations 
      WHERE DATE(CheckOutDate) = ? AND Status = 'Active'
    `, [today]);
    const todayCheckOuts = checkOutsRows[0].count;
    
    // Booking trends based on filter
    let daysBack = 7;
    if (timeFilter === 'today') {
      daysBack = 1;
    } else if (timeFilter === '30days') {
      daysBack = 30;
    }
    
    const [trendsRows]: any = await dbConnection.execute(`
      SELECT 
        DATE(CreatedAt) as date,
        COUNT(*) as count
      FROM Reservations
      WHERE CreatedAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(CreatedAt)
      ORDER BY DATE(CreatedAt) ASC
    `, [daysBack]);
    
    const totalBookings = trendsRows.reduce((sum: number, row: any) => sum + row.count, 0);
    
    console.log('📈 Booking trends data:', trendsRows);
    console.log('📊 Total bookings:', totalBookings);
    
    // Previous period for comparison
    const [prevPeriodRows]: any = await dbConnection.execute(`
      SELECT COUNT(*) as count
      FROM Reservations
      WHERE CreatedAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND CreatedAt < DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [daysBack * 2, daysBack]);
    
    const previousBookings = prevPeriodRows[0].count || 1;
    const bookingsChange = Math.round(((totalBookings - previousBookings) / previousBookings) * 100);
    
    // Mock percentage changes (you can calculate these properly later)
    const occupancyChange = Math.floor(Math.random() * 10) - 2; // Random between -2 and 7
    const checkInsChange = Math.floor(Math.random() * 10) - 2;
    const checkOutsChange = Math.floor(Math.random() * 10) - 5;
    
    const result = {
      occupancyRate,
      occupancyChange,
      todayCheckIns,
      checkInsChange,
      todayCheckOuts,
      checkOutsChange,
      bookingTrends: trendsRows,
      totalBookings,
      bookingsChange
    };
    
    console.log('✅ Returning dashboard stats:', result);
    
    return result;
  } catch (error: any) {
    console.error('❌ Failed to get dashboard stats:', error);
    throw error;
  }
});

// Window control handlers
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

console.log('🚀 Electron main process started');
