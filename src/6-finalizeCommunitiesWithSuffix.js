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

    // Get current date and time in a specific format e.g., YYYY-MM-DD_HH-MM
    const now = new Date();
    const dateTimeSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

    // Update the "name" values with the original suffix and the date-time suffix
    const updatedCommunitiesWithSuffix = updatedCommunities.map((community) => {
      community.name += ` -- ${suffix} -- ${dateTimeSuffix}`;
      return community;
    });

    // Save the updated communities back to the original updatedCommunities.json file
    await fs.writeFile(updatedCommunitiesFilePath, JSON.stringify(updatedCommunitiesWithSuffix, null, 2), 'utf8');
    console.log('Names updated with suffix and date-time in updatedCommunities.json.');
  } catch (error) {
    console.error('Error updating names with suffix and date-time:', error.message);
  }
}

// Call the function to update names with suffix and date-time
module.exports = updateNamesWithSuffix;
