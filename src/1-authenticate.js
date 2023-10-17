const axios = require('axios');
const fs = require('fs/promises'); // Use fs.promises for async file operations

// Function to read the config.json file
async function readConfigFile() {
  try {
    const configData = await fs.readFile('./config.json', 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error('Error reading config.json: ' + error.message);
  }
}

// Function to authenticate and get a CSRF token
async function authenticate() {
  try {
    const config = await readConfigFile();
    const { baseREST, username, password } = config.targetSystem;

    const authPayload = {
      username: username,
      password: password,
    };

    const response = await axios.post(`${baseREST}/auth/sessions`, authPayload);

    if (response.status === 200 && response.data.csrfToken) {
      console.log('Authentication successful. User: ' + username);
      return response.data.csrfToken;
    } else {
      console.error('Authentication failed.');
      return null;
    }
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
}

// Main function to start the authentication process
async function startAuthentication() {
  const csrfToken = await authenticate();

  if (csrfToken) {
    // You can now use the csrfToken for further requests to the authenticated API.
    // Implement your logic here.
  } else {
    console.error('Authentication failed. Please check your credentials.');
  }
}

// Call the main authentication function
module.exports = startAuthentication;
