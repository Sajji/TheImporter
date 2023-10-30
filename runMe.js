const axios = require('axios');
const fs = require('fs').promises;
const readline = require('readline');
const path = require('path');

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Function to prompt user question and return the answer
    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
        // Question 1
        const sourceDir = await question('Location of the backup folder? ');
        const summaryPath = path.join(sourceDir, 'summary.json');
        try {
            await fs.access(summaryPath);
        } catch (err) {
            throw new Error('Backup folder does not exist or summary.json not found in the folder.');
        }

        const configPath = 'config.json';
        try {
            await fs.access(configPath);
            const existingConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
            console.log('Existing configuration found:', existingConfig);

            const useExistingConfig = await question('Do you want to use the existing configuration? (yes/no) ');

            if (useExistingConfig.toLowerCase().startsWith('y')) {
                console.log('Using existing configuration. Exiting.');
                rl.close();
                return;
            }
        } catch (err) {
            // No existing config found, continue to the next questions
        }

        // Question 2
        const domain = await question('Domain of your target system? ');
        const baseREST = `https://${domain}/rest/2.0/`;

        // Questions 3 and 4
// Questions 3 and 4
let username = await question("What's the username? ");
let password = await question("What's the password? ");

// Verify connectivity and authenticate
let attempts = 3;
let isAuthenticated = false;
let cookie = '';  // Declare these variables outside the loop so you can use them later.
let csrfToken = '';

while (attempts > 0 && !isAuthenticated) {
    try {
        const authResponse = await axios.post(
            `${baseREST}auth/sessions`,
            { username, password },
            { withCredentials: true }
        );

        if (authResponse.status === 200 && authResponse.data.csrfToken) {
            isAuthenticated = true;

            // Extract the 'set-cookie' header and csrfToken from the authentication response
            cookie = authResponse.headers['set-cookie'].join('; ');
            csrfToken = authResponse.data.csrfToken;

        } else {
            attempts--;
            if (attempts > 0) {
                console.log(`Authentication failed. You have ${attempts} attempt(s) left.`);
                // Optionally, re-prompt the user for credentials if you want them to try with different credentials:
                username = await question("What's the username? ");
                password = await question("What's the password? ");
            } else {
                throw new Error('Authentication failed after 3 attempts.');
            }
        }
    } catch (error) {
        attempts--;
        if (attempts > 0) {
            console.log(`Error during authentication. You have ${attempts} attempt(s) left. Please try again.`);
            // Optionally, re-prompt the user for credentials if you want them to try with different credentials:
            username = await question("What's the username? ");
            password = await question("What's the password? ");
        } else {
            throw new Error('Authentication failed after 3 attempts due to recurring errors.');
        }
    }
}

// Prepare the authorization headers with the csrfToken and cookies
const headers = {
    'Authorization': `Bearer ${csrfToken}`,
    'Cookie': cookie,
};

        // Question 5
        const landingZone = await question('Landing zone? ');
        let landingZoneId = '';
        try {
            // Checking if the community exists
            const getCommunityResponse = await axios.get(
                `${baseREST}communities?name=${encodeURIComponent(landingZone)}&nameMatchMode=EXACT`,
                { headers }
            );

            if (getCommunityResponse.data && getCommunityResponse.data.results && getCommunityResponse.data.results.length > 0) {
                landingZoneId = getCommunityResponse.data.results[0].id;  // Existing community ID
            } else {
                // If not exist, create new one
                const createCommunityResponse = await axios.post(
                    `${baseREST}communities`,
                    { name: landingZone, description: landingZone },
                    { headers }
                );
                landingZoneId = createCommunityResponse.data.id;  // New community ID
            }
        } catch (error) {
            throw new Error('Error verifying or creating landing zone.');
        }

        // Last question
        const suffix = await question('What suffix do you want to use? ');

        const config = {
            targetSystem: {
                sourceDir,
                baseREST,
                username,
                password,
                landingZone,
                landingZoneId,
                suffix,
            },
        };

        await fs.writeFile('config.json', JSON.stringify(config, null, 2));
        console.log('Config saved successfully.');
    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        rl.close();
    }
}

// Start the script
main();
