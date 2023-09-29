const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to validate if a directory exists
function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to filter JSON files
function filterJSONFiles(files) {
  return files.filter((file) => file.endsWith('.json'));
}

// Function to verify directory based on summary.json
function verifyDirectory(sourceDir) {
  const summaryPath = `${sourceDir}/summary.json`;
  if (fs.existsSync(summaryPath)) {
    try {
      const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

      // Verify assets files
      const assetsFiles = Object.keys(summaryData.assetsFilesDetails);
      const assetsFilesCount = assetsFiles.length;
      const actualAssetsFiles = filterJSONFiles(assetsFiles);

      if (
        assetsFilesCount === actualAssetsFiles.length &&
        assetsFiles.every((file) => actualAssetsFiles.includes(file))
      ) {
        console.log('Assets files are verified.');

        // Update config.json with sourceDir
        updateConfigFile(sourceDir);
      } else {
        console.error('Assets files verification failed.');
      }

      // Verify specific files
      const specificFiles = Object.keys(summaryData.specificFilesDetails);

      const missingSpecificFiles = specificFiles.filter(
        (file) => !fs.existsSync(`${sourceDir}/${file}`)
      );

      if (missingSpecificFiles.length === 0) {
        console.log('Specific files are verified.');
      } else {
        console.error('Specific files verification failed. Missing files:', missingSpecificFiles);
      }
    } catch (err) {
      console.error('Error parsing summary.json:', err);
    }
  } else {
    console.error('The summary.json file does not exist in the directory.');
  }
}

// Function to update the config.json file with sourceDir
function updateConfigFile(sourceDir) {
  const configPath = './config.json';

  if (fs.existsSync(configPath)) {
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      configData.targetSystem.sourceDir = sourceDir;

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
      console.log('config.json updated with sourceDir:', sourceDir);
    } catch (error) {
      console.error('Error updating config.json:', error.message);
    }
  } else {
    console.error('config.json does not exist.');
  }
}

// Prompt the user for the source directory
rl.question('Enter the location of the sourceBackups directory: ', (sourceDir) => {
  if (directoryExists(sourceDir)) {
    verifyDirectory(sourceDir);
  } else {
    console.error('The directory does not exist.');
  }
  rl.close();
});
