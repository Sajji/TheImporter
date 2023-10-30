const fs = require('fs/promises');
const path = require('path');

async function readConfigFile() {
  try {
    const configData = await fs.readFile('./config.json', 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error('Error reading config.json: ' + error.message);
  }
}

async function updateCommunitiesFile() {
  try {
    const config = await readConfigFile();
    const { sourceDir, landingZone, landingZoneId } = config.targetSystem;

    // Read the original communities.json file
    const communitiesFilePath = path.join('./', sourceDir, 'communities.json');
    const communitiesData = await fs.readFile(communitiesFilePath, 'utf8');
    const communities = JSON.parse(communitiesData);

    // Update communities without parentId and parentName
    const updatedCommunities = communities.map((community) => {
      if (!community.parentId && !community.parentName) {
        return {
          ...community,
          parentId: landingZoneId,
          parentName: landingZone,
        };
      }
      return community;
    });

    // Write the updated communities to the outputFiles directory
    const updatedCommunitiesFilePath = path.join('./outputFiles', 'updatedCommunities.json');
    await fs.writeFile(updatedCommunitiesFilePath, JSON.stringify(updatedCommunities, null, 2), 'utf8');
    console.log('Communities file updated and saved to outputFiles directory.');
  } catch (error) {
    console.error('Error updating communities file:', error.message);
  }
}

// Call the function to update communities.json
module.exports = updateCommunitiesFile;
