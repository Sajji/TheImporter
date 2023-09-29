const fs = require('fs/promises');
const path = require('path');

async function updateUUIDs() {
  try {
    // Read the updatedCommunities.json file from the outputFiles directory
    const updatedCommunitiesFilePath = path.join('./outputFiles', 'updatedCommunities.json');
    const updatedCommunitiesData = await fs.readFile(updatedCommunitiesFilePath, 'utf8');
    const updatedCommunities = JSON.parse(updatedCommunitiesData);

    // Read the uuidMapping.json file from the outputFiles directory
    const uuidMappingFilePath = path.join('./outputFiles', 'uuidMapping.json');
    const uuidMappingData = await fs.readFile(uuidMappingFilePath, 'utf8');
    const uuidMapping = JSON.parse(uuidMappingData);

    // Update the "id" and "parentId" values based on the mapping
    const updatedCommunitiesWithUUIDs = updatedCommunities.map((community) => {
      const oldId = community.id;
      const oldParentId = community.parentId;

      // Check if the old IDs exist in the mapping
      if (oldId in uuidMapping) {
        community.id = uuidMapping[oldId];
      }

      if (oldParentId in uuidMapping) {
        community.parentId = uuidMapping[oldParentId];
      }

      return community;
    });

    // Save the updated communities to the original updatedCommunities.json file
    await fs.writeFile(updatedCommunitiesFilePath, JSON.stringify(updatedCommunitiesWithUUIDs, null, 2), 'utf8');
    console.log('UUIDs updated in updatedCommunities.json.');
  } catch (error) {
    console.error('Error updating UUIDs:', error.message);
  }
}

// Call the function to update UUIDs
module.exports = updateUUIDs;
