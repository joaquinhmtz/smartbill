// smartbill/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startTracking, stopTracking } = require('./tracker');

let mainWindow;

function createWindow() {
  // Create a fixed-size window
  mainWindow = new BrowserWindow({
    width: 300,
    height: 150,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load control.html from the same folder
  mainWindow.loadFile(path.join(__dirname, 'control.html'));

  // Hide the default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Cleanup on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// When Electron is ready, create the control window
app.whenReady().then(createWindow);

// On macOS re-open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when window(s) are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listen for IPC messages from control.html
ipcMain.on('control', (event, command) => {
  if (command === 'start') {
    console.log('🟢 Received START command');
    startTracking();
  } else if (command === 'stop') {
    console.log('🔴 Received STOP command');
    stopTracking();
  }
});
