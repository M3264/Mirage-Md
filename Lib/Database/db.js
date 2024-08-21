const sqlite3 = require('sqlite3').verbose();
let db;

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./Lib/Database/bot.db', (err) => {
      if (err) {
        console.error('Error connecting to the bot database:', err.message);
        reject(err); 
      } else {
        console.log('Connected to the bot database.');
        resolve(db); // Resolve with the initialized db object
      }
    });
  });
}

async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database connection closed.');
          resolve();
        }
      });
    } else {
      console.log('No database connection to close.');
      resolve(); // No database connection to close
    }
  });
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  closeDatabase().then(() => {
    process.exit(1); // Exit with failure
  }).catch((closeErr) => {
    console.error('Error closing database during uncaught exception:', closeErr);
    process.exit(1); // Exit with failure
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  closeDatabase().then(() => {
    process.exit(1); // Exit with failure
  }).catch((closeErr) => {
    console.error('Error closing database during unhandled rejection:', closeErr);
    process.exit(1); // Exit with failure
  });
});

// Handle process exit gracefully
process.on('exit', async () => {
  try {
    await closeDatabase(); // Close database connection before exiting
  } catch (err) {
    console.error('Error closing database during exit:', err);
  }
});

module.exports = { 
  initializeDatabase, 
  getDB: () => db,
  closeDatabase
};
