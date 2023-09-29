const axios = require('axios');
const fs = require('fs/promises');

async function readConfigFile() {
  try {
    const configData = await fs.readFile('./config.json', 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error('Error reading config.json: ' + error.message);
  }
}

async function updateConfigLandingZoneId(landingZoneId) {
  try {
    const config = await readConfigFile();
    config.targetSystem.landingZoneId = landingZoneId;

    await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
    console.log('config.json updated with landingZoneId:', landingZoneId);
  } catch (error) {
    console.error('Error updating config.json:', error.message);
  }
}

async function landingZone() {
  try {
    const config = await readConfigFile();
    const { baseREST, landingZone, username, password } = config.targetSystem;

    // Axios request configuration with basic authentication
    const axiosConfig = {
      auth: {
        username: username,
        password: password,
      },
    };

    // Check if the community exists
    const communityCheckURL = `${baseREST}communities?name=${landingZone}&nameMatchMode=EXACT`;
    const response = await axios.get(communityCheckURL, axiosConfig);

    if (response.data.total === 0) {
      // Community doesn't exist, create it
      const createCommunityURL = `${baseREST}communities`;
      const communityPayload = {
        name: landingZone,
        description: landingZone,
      };

      const createResponse = await axios.post(createCommunityURL, communityPayload, axiosConfig);

      if (createResponse.status === 201) {
        console.log('Community created successfully.');
        console.log('Community ID:', createResponse.data.id);

        // Update landingZoneId in config.json
        await updateConfigLandingZoneId(createResponse.data.id);
      } else {
        console.error('Failed to create the community.');
      }
    } else if (response.data.total === 1) {
      // Community already exists
      console.log('Community already exists.');
      console.log('Community ID:', response.data.results[0].id);

      // Update landingZoneId in config.json
      await updateConfigLandingZoneId(response.data.results[0].id);
    } else {
      console.error('Unexpected response when checking for the community.');
    }
  } catch (error) {
    console.error('Error checking/creating community:', error.message);
  }
}

// Call the function to check and create the community
module.exports = landingZone;
