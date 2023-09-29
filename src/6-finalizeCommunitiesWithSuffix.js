const fs = require('fs/promises');
const path = require('path');

async function updateNamesWithSuffix() {
  try {
    // Read the updatedCommunities.json file from the outputFiles directory
    const updatedCommunitiesFilePath = path.join('./outputFiles', 'updatedCommunities.json');
    const updatedCommunitiesData = await fs.readFile(updatedCommunitiesFilePath, 'utf8');
    const updatedCommunities = JSON.parse(updatedCommunitiesData);

    // Read the config.json file from the root directory
    const configFilePath = path.join('./config.json');
    const configData = await fs.readFile(configFilePath, 'utf8');
    const config = JSON.parse(configData);
    const suffix = config.targetSystem.suffix;

    // Update the "name" values with the suffix
    const updatedCommunitiesWithSuffix = updatedCommunities.map((community) => {
      community.name += ` -- ${suffix}`;
      return community;
    });

    // Save the updated communities back to the original updatedCommunities.json file
    await fs.writeFile(updatedCommunitiesFilePath, JSON.stringify(updatedCommunitiesWithSuffix, null, 2), 'utf8');
    console.log('Names updated with suffix in updatedCommunities.json.');
  } catch (error) {
    console.error('Error updating names with suffix:', error.message);
  }
}

// Call the function to update names with suffix
module.exports = updateNamesWithSuffix;
