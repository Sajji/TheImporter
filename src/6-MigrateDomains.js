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

// Function to read the domains.json file from the configured source directory
async function readDomainsFile(sourceDir) {
    try {
        const domainsData = await fs.readFile(`${sourceDir}/domains.json`, 'utf8');
        return JSON.parse(domainsData);
    } catch (error) {
        throw new Error('Error reading domains.json: ' + error.message);
    }
}

async function migrateDomains() {
    const config = await getConfig();
    const domains = await readDomainsFile(config.targetSystem.sourceDir);
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

    for (const domain of domains) {
        try {
            await axios.get(`${baseREST}domains/${domain.id}`, { headers });
            console.log(`Domain with name "${domain.name}" already exists.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Create the domain
                const payload = {
                    id: domain.id,
                    name: domain.newName,
                    typeId: domain.typeId,
                    communityId: domain.communityId
                };

                await axios.post(`${baseREST}domains`, payload, { headers });
                console.log(`Domain with name "${domain.newName}" has been created.`);
            } else {
                console.error(`Error checking/creating domain "${domain.name}": ${error.message}`);
            }
        }
    }
}

// Export the function for external usage
module.exports = migrateDomains;
