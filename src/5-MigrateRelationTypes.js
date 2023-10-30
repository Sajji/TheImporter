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

// Function to read the relationTypes.json file from the configured source directory
async function readRelationTypesFile(sourceDir) {
    try {
        const relationTypesData = await fs.readFile(`${sourceDir}/relationTypes.json`, 'utf8');
        return JSON.parse(relationTypesData);
    } catch (error) {
        throw new Error('Error reading relationTypes.json: ' + error.message);
    }
}

async function migrateRelationTypes() {
    const config = await getConfig();
    const relationTypes = await readRelationTypesFile(config.targetSystem.sourceDir);
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

    for (const relationType of relationTypes) {
        try {
            await axios.get(`${baseREST}relationTypes/${relationType.id}`, { headers });
            console.log(`RelationType with unique key "${relationType.uniqueKey}" already exists.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Create the relationType
                const payload = {
                    id: relationType.id,
                    sourceTypeId: relationType.sourceTypeId,
                    role: relationType.role,
                    targetTypeId: relationType.targetTypeId,
                    coRole: relationType.coRole
                };
                
                if (relationType.description) {
                    payload.description = relationType.description;
                }

                await axios.post(`${baseREST}relationTypes`, payload, { headers });
                console.log(`RelationType with unique key "${relationType.uniqueKey}" has been created.`);
            } else {
                console.error(`Error checking/creating relationType with unique key "${relationType.uniqueKey}": ${error.message}`);
            }
        }
    }
}

// Export the function for external usage
module.exports = migrateRelationTypes;
