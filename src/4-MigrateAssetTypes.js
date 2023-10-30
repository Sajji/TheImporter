const fs = require('fs/promises');
const axios = require('axios');

// Fetch configuration values
async function getConfig() {
    try {
        const configData = await fs.readFile('./config.json', 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        throw new Error('Error reading config.json: ' + error.message);
    }
}

// Function to read the assetTypes.json file from the configured source directory
async function readAssetTypesFile(sourceDir) {
    try {
        const assetTypesData = await fs.readFile(`${sourceDir}/assetTypes.json`, 'utf8');
        return JSON.parse(assetTypesData);
    } catch (error) {
        throw new Error('Error reading assetTypes.json: ' + error.message);
    }
}

async function migrateAssetTypes() {
    const config = await getConfig();
    const assetTypes = await readAssetTypesFile(config.targetSystem.sourceDir);
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

    for (const assetType of assetTypes) {
        try {
            await axios.get(`${baseREST}assetTypes/${assetType.id}`, { headers });
            console.log(`AssetType with name "${assetType.name}" already exists.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Create the assetType
                await axios.post(
                    `${baseREST}assetTypes`,
                    {
                        id: assetType.id,
                        name: assetType.newName,
                        description: assetType.description
                    },
                    { headers }
                );
                console.log(`AssetType with name "${assetType.newName}" has been created.`);
            } else {
                console.error(`Error checking/creating assetType "${assetType.name}": ${error.message}`);
            }
        }
    }

    for (const assetType of assetTypes) {
        try {
            await axios.patch(
                `${baseREST}assetTypes/${assetType.id}`,
                {
                    id: assetType.id,
                    parentId: assetType.parentId
                },
                { headers }
            );
            console.log(`Parent set for assetType "${assetType.newName}".`);
        } catch (error) {
            console.error(`Error setting parent for assetType "${assetType.name}": ${error.message}`);
        }
    }
}

// Export the function for external usage
module.exports = migrateAssetTypes;
