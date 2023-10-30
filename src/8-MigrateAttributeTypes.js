const fs = require('fs/promises');
const axios = require('axios');

async function getConfig() {
    try {
        const configData = await fs.readFile('./config.json', 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        throw new Error('Error reading config.json: ' + error.message);
    }
}

async function readAttributeTypesFile(sourceDir) {
    try {
        const attributeTypesData = await fs.readFile(`${sourceDir}/attributeTypes.json`, 'utf8');
        return JSON.parse(attributeTypesData);
    } catch (error) {
        throw new Error('Error reading attributeTypes.json: ' + error.message);
    }
}

async function migrateAttributeTypes() {
    const config = await getConfig();
    const attributeTypes = await readAttributeTypesFile(config.targetSystem.sourceDir);
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

    for (const attributeType of attributeTypes) {
        try {
            await axios.get(`${baseREST}attributeTypes/${attributeType.id}`, { headers });
            console.log(`AttributeType with name "${attributeType.newName}" already exists.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Filter out unwanted keys
                const { createdBy, createdOn, lastModifiedBy, lastModifiedOn, name, ...postPayload } = attributeType;
                
                // Use 'newName' in place of 'name'
                postPayload.name = attributeType.newName;

                // Create the attributeType
                await axios.post(
                    `${baseREST}attributeTypes`,
                    postPayload,
                    { headers }
                );
                console.log(`AttributeType with name "${attributeType.newName}" has been created.`);
            } else {
                console.error(`Error checking/creating attributeType "${attributeType.newName}": ${error.message}`);
            }
        }
    }
}

// Export the function for external usage
module.exports = migrateAttributeTypes;
