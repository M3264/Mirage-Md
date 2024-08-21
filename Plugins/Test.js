/* const fs = require('fs');
const path = require('path');

module.exports = {
  usage: ['settings', 'config'],
  description: 'View or update specific bot settings',
  emoji: '⚙️',
  commandType: 'Admin',
  isWorkAll: true,
  async execute(sock, m, args) {
   
  },
};


// Define the path to the file containing the code
const filePath = path.join(__dirname, '../Settings.js');

// Read the contents of the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Extract the global objects from the code
  const globalObjects = extractGlobalsFromJS(data);

  // Display the object names and their values
  for (const objectName in globalObjects) {
    if (globalObjects.hasOwnProperty(objectName)) {
      printObject(globalObjects[objectName], 0);
    }
  }
});

// Function to extract global objects from JavaScript code
function extractGlobalsFromJS(jsCode) {
    const globals = {};
    const globalVarRegex = /global\.(.*?)\s*=\s*(.*?);/gs;
    let match;
    const assignments = [];
  
    while ((match = globalVarRegex.exec(jsCode)) !== null) {
      const key = match[1].trim();
      const value = parseValue(eval(match[2]));
      assignments.push({ key, value });
    }
  
    for (const { key, value } of assignments) {
      const keys = key.split('.');
      let currentObj = globals;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!currentObj[k]) {
          currentObj[k] = {};
        }
        currentObj = currentObj[k];
      }
      currentObj[keys[keys.length - 1]] = value;
    }
  
    return globals;
}

// Function to parse values and handle different data types
function parseValue(value) {
  if (Array.isArray(value)) {
    return value.map(parseValue);
  } else if (typeof value === 'object' && value !== null) {
    const parsedObj = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        parsedObj[key] = parseValue(value[key]);
      }
    }
    return parsedObj;
  } else {
    return value;
  }
}

// Function to print an object with proper indentation
function printObject(obj, indent) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'object') {
        printObject(value, indent + 1);
      } else {
      }
    }
  }
}

function saveChanges(updatedSettings) {
  try {
    // Read the contents of the config.js file
    const filePath = path.join(__dirname, '../Settings.js');
    fs.readFile(filePath, 'utf8', (readErr, configCode) => {
      if (readErr) {
        throw readErr;
      }

      // Update the values in the config code
      for (const fieldName in updatedSettings) {
        if (updatedSettings.hasOwnProperty(fieldName)) {
          // Parse field name to extract object path and property name
          const [objectName, propertyName] = fieldName.split(':');

          // Construct regex to match the property assignment
          const regex = new RegExp(`global\\.${objectName}\\.${propertyName}\\s*=\\s*(.*?);`, 'g');

          // Construct replacement string with the updated value
          const replacement = `global.${objectName}.${propertyName} = ${JSON.stringify(updatedSettings[fieldName])};`;

          // Perform the replacement
          configCode = configCode.replace(regex, replacement);
        }
      }

      // Write the modified config code back to the file
      fs.writeFile(filePath, configCode, (writeErr) => {
        if (writeErr) {
          throw writeErr;
        }

        console.log('Settings updated successfully:', updatedSettings);
      });
    });
  } catch (error) {
    console.error('Error saving changes:', error);
  }
}
*/
