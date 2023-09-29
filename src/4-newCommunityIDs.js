const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function generateUUIDs() {
  try {
    // Read the updatedCommunities.json file from the outputFiles directory
    const updatedCommunitiesFilePath = path.join('./outputFiles', 'updatedCommunities.json');
    const updatedCommunitiesData = await fs.readFile(updatedCommunitiesFilePath, 'utf8');
    const updatedCommunities = JSON.parse(updatedCommunitiesData);

    // Create a mapping object to store old and new UUIDs
    const uuidMapping = {};

    // Generate new UUIDs for "id" keys and update the mapping
    const updatedCommunitiesWithUUIDs = updatedCommunities.map((community) => {
      const oldId = community.id;
      const newId = uuidv4(); // Generate a new UUID

      // Store the mapping between old and new UUIDs
      uuidMapping[oldId] = newId;

      // Replace the "id" key with the new UUID
      community.id = newId;

      return community;
    });

    // Print the updated JSON data
    console.log('Updated JSON Data:');
    console.log(updatedCommunitiesWithUUIDs);

    // Print the UUID mapping
    console.log('UUID Mapping:');
    console.log(uuidMapping);

    // Save the UUID mapping to a file
    const uuidMappingFilePath = path.join('./outputFiles', 'uuidMapping.json');
    await fs.writeFile(uuidMappingFilePath, JSON.stringify(uuidMapping, null, 2), 'utf8');
    console.log('UUID Mapping saved to uuidMapping.json file.');
  } catch (error) {
    console.error('Error generating UUIDs:', error.message);
  }
}

// Call the function to generate UUIDs and create a mapping
module.exports = generateUUIDs;
