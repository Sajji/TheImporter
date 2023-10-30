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

// Function to read the domainTypes.json file from the configured source directory
async function readDomainTypesFile(sourceDir) {
    try {
        const domainTypesData = await fs.readFile(`${sourceDir}/domainTypes.json`, 'utf8');
        return JSON.parse(domainTypesData);
    } catch (error) {
        throw new Error('Error reading domainTypes.json: ' + error.message);
    }
}

async function migrateDomainTypes() {
    const config = await getConfig();
    const domainTypes = await readDomainTypesFile(config.targetSystem.sourceDir);
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

    for (const domainType of domainTypes) {
        try {
            await axios.get(`${baseREST}domainTypes/${domainType.id}`, { headers });
            console.log(`DomainType with name "${domainType.name}" already exists.`);
        } catch {

                await axios.post(
                    `${baseREST}domainTypes`,
                    {
                        id: domainType.id,
                        name: domainType.newName,
                        description: domainType.description
                    },
                    { headers }
                );
                console.log(`DomainType with name "${domainType.newName}" has been created.`);

        }
    }

    for (const domainType of domainTypes) {
        try {
            await axios.patch(
                `${baseREST}domainTypes/${domainType.id}`,
                {
                    id: domainType.id,
                    parentId: domainType.parentId
                },
                { headers }
            );
            console.log(`Parent set for domainType "${domainType.newName}".`);
        } catch {
            console.log(`Error setting parent for domainType "${domainType.name}"`);
        }
    }
}

// Export the function for external usage
module.exports = migrateDomainTypes;
