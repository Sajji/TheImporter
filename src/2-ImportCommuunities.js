const fs = require('fs/promises');
const axios = require('axios');

async function readUpdatedCommunitiesFile() {
    try {
        const communitiesData = await fs.readFile('./outputFiles/updatedCommunities.json', 'utf8');
        return JSON.parse(communitiesData);
    } catch (error) {
        throw new Error('Error reading updatedCommunities.json: ' + error.message);
    }
}

async function getConfig() {
    try {
        const configData = await fs.readFile('./config.json', 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        throw new Error('Error reading config.json: ' + error.message);
    }
}

async function importCommunities() {
    const communities = await readUpdatedCommunitiesFile();
    const config = await getConfig();
    const { baseREST, username, password } = config.targetSystem;

    // Authenticate and get headers
    const authResponse = await axios.post(
        `${baseREST}auth/sessions`,
        { username, password },
        { withCredentials: true }
    );

    const cookie = authResponse.headers['set-cookie'].join('; ');
    const csrfToken = authResponse.data.csrfToken;

    const headers = {
        'Authorization': `Bearer ${csrfToken}`,
        'Cookie': cookie,
    };

    for (const community of communities) {
        try {
            await axios.get(`${baseREST}communities/${community.id}`, { headers });
            console.log(`Community with name "${community.name}" already exists.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Create the community
                await axios.post(
                    `${baseREST}communities`,
                    {
                        id: community.id,
                        name: community.newName,
                        description: community.description
                    },
                    { headers }
                );
                console.log(`Community with name "${community.newName}" has been created.`);
            } else {
                console.error(`Error checking/creating community "${community.name}": ${error.message}`);
            }
        }
    }

    for (const community of communities) {
        try {
            await axios.patch(
                `${baseREST}communities/${community.id}`,
                {
                    id: community.id,
                    parentId: community.parentId
                },
                { headers }
            );
            console.log(`Parent set for community "${community.newName}".`);
        } catch (error) {
            console.error(`Error setting parent for community "${community.name}": ${error.message}`);
        }
    }
}

// Execute the function
module.exports = importCommunities
