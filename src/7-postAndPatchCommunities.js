const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const configFile = require('./config.json');

async function addAndUpdateCommunities() {
  try {
    const baseREST = configFile.targetSystem.baseREST;
    const username = configFile.targetSystem.username;
    const password = configFile.targetSystem.password;

    const axiosConfig = {
      auth: {
        username: username,
        password: password,
      },
    };

    // Read the updatedCommunities.json file from the outputFiles directory
    const updatedCommunitiesFilePath = path.join('./outputFiles', 'updatedCommunities.json');
    const updatedCommunitiesData = await fs.readFile(updatedCommunitiesFilePath, 'utf8');
    const updatedCommunities = JSON.parse(updatedCommunitiesData);

    // First pass: POST requests
    for (const community of updatedCommunities) {
      const payload = {
        id: community.id,
        name: community.name,
      };

      if (community.description) {
        payload.description = community.description;
      }

      await axios.post(`${baseREST}communities`, payload, axiosConfig);
      console.log(`POST request sent for community ID: ${community.id}`);
    }

    // Second pass: PATCH requests
    for (const community of updatedCommunities) {
      const payload = {
        id: community.id,
        name: community.name,
        parentId: community.parentId,
      };

      if (community.description) {
        payload.description = community.description;
      }

      await axios.patch(`${baseREST}communities/${community.id}`, payload, axiosConfig);
      console.log(`PATCH request sent for community ID: ${community.id}`);
    }

    console.log('API requests completed successfully.');
  } catch (error) {
    console.error('Error performing API requests:', error.message);
  }
}

// Call the function to perform API requests
module.exports = addAndUpdateCommunities;
