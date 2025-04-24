// smartbill/tracker.js

const { uploadLog } = require('./firebase');
const activeWin       = require('active-win');
const screenshot      = require('screenshot-desktop');
const fs              = require('fs');
const path            = require('path');

const EXCLUDED_APPS   = ['WhatsApp', 'Spotify'];
const SCREENSHOT_MIN  = 12; // in minutes

const LOG_FILE        = path.join(__dirname, 'activity-log.json');
const SCREENSHOT_DIR  = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

let activityLog        = [];
let lastActivity       = null;  // { ts: ISOString, app: string, title: string }
let trackInterval      = null;
let screenshotInterval = null;

function saveLog() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(activityLog, null, 2));
}

async function trackActiveWindow() {
  try {
    const result = await activeWin();
    if (!result) return console.log('❓ No active window');

    const { owner, title } = result;
    const appName = owner.name;
    const now     = new Date();

    // Skip excluded apps but keep lastActivity intact
    if (EXCLUDED_APPS.includes(appName)) {
      return;
    }

    console.log(`🖥️ Active: ${appName} — "${title}"`);

    // First ever poll: set lastActivity
    if (!lastActivity) {
      lastActivity = { ts: now.toISOString(), app: appName, title };
      return;
    }

    // If user switched to a DIFFERENT window, log the old one
    if (appName !== lastActivity.app || title !== lastActivity.title) {
      const startTime = new Date(lastActivity.ts);
      const duration  = Math.round((now - startTime) / 1000);

      const entry = {
        timestamp:       lastActivity.ts,
        app:             lastActivity.app,
        windowTitle:     lastActivity.title,
        durationSeconds: duration
      };

      console.log('📤 Logging:', entry);
      activityLog.push(entry);
      saveLog();

      console.log('🔍 Calling uploadLog…');
      uploadLog(entry);

      // Now reset lastActivity to the new window
      lastActivity = { ts: now.toISOString(), app: appName, title };
    }
    // else: same window, do nothing—keep accumulating
  } catch (e) {
    console.error('❌ trackActiveWindow error:', e);
  }
}

function takeScreenshot() {
  const file = `screenshot_${Date.now()}.jpg`;
  const dest = path.join(SCREENSHOT_DIR, file);
  screenshot({ filename: dest })
    .then(() => console.log('📸 Screenshot saved:', file))
    .catch(err => console.error('❌ Screenshot error:', err));
}

function startTracking() {
  if (trackInterval) {
    console.log('⚠️ Tracker already running');
    return;
  }
  console.log('✅ Tracker started');
  trackActiveWindow();  // initialize lastActivity
  takeScreenshot();     // initial screenshot

  trackInterval      = setInterval(trackActiveWindow, 5000);
  screenshotInterval = setInterval(
    takeScreenshot,
    SCREENSHOT_MIN * 60 * 1000
  );
}

function stopTracking() {
  clearInterval(trackInterval);
  clearInterval(screenshotInterval);
  trackInterval      = null;
  screenshotInterval = null;
  lastActivity       = null; // reset so next start is fresh
  console.log('🛑 Tracker stopped');
}

module.exports = { startTracking, stopTracking };

// Allow `node tracker.js` for quick tests:
if (require.main === module) {
  startTracking();
}
