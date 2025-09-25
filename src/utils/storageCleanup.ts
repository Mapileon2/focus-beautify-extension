// Utility functions for cleaning up Chrome storage issues

export async function clearChromeStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      // Clear both sync and local storage
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      console.log('Chrome storage cleared successfully');
    } catch (error) {
      console.error('Failed to clear Chrome storage:', error);
    }
  }
}

export async function migrateLargeDataToLocal() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      // Get all sync storage data
      const syncData = await chrome.storage.sync.get(null);
      
      // Find items that might be too large for sync storage
      const largeItems: { [key: string]: any } = {};
      const keepInSync: { [key: string]: any } = {};
      
      for (const [key, value] of Object.entries(syncData)) {
        const size = new Blob([JSON.stringify(value)]).size / 1024;
        if (size > 4) { // If larger than 4KB, move to local
          largeItems[key] = value;
        } else {
          keepInSync[key] = value;
        }
      }
      
      if (Object.keys(largeItems).length > 0) {
        console.log('Migrating large items to local storage:', Object.keys(largeItems));
        
        // Clear sync storage
        await chrome.storage.sync.clear();
        
        // Restore small items to sync
        if (Object.keys(keepInSync).length > 0) {
          await chrome.storage.sync.set(keepInSync);
        }
        
        // Move large items to local
        await chrome.storage.local.set(largeItems);
        
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.error('Failed to migrate storage:', error);
    }
  }
}

export function getStorageUsage() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.getBytesInUse(null, (bytes) => {
      console.log('Sync storage usage:', bytes, 'bytes');
    });
    
    chrome.storage.local.getBytesInUse(null, (bytes) => {
      console.log('Local storage usage:', bytes, 'bytes');
    });
  }
}

export async function checkStorageHealth() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const syncData = await chrome.storage.sync.get(null);
      const issues: string[] = [];
      
      for (const [key, value] of Object.entries(syncData)) {
        const size = new Blob([JSON.stringify(value)]).size / 1024;
        if (size > 8) {
          issues.push(`${key}: ${Math.round(size)}KB (exceeds 8KB sync limit)`);
        }
      }
      
      if (issues.length > 0) {
        console.warn('Storage issues found:', issues);
        return { healthy: false, issues };
      }
      
      return { healthy: true, issues: [] };
    } catch (error) {
      console.error('Failed to check storage health:', error);
      return { healthy: false, issues: ['Failed to check storage'] };
    }
  }
  
  return { healthy: true, issues: [] };
}