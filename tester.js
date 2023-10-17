const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const startAuthentication = require('./src/1-authenticate');
const getCommunities = require('./src/2-landingZone');
const updateCommunitiesFile = require('./src/3-communitiesOutput');
const generateUUIDs = require('./src/4-newCommunityIDs');
const updateUUIDs = require('./src/5-finalizeCommunities');
const updateNamesWithSuffix = require('./src/6-finalizeCommunitiesWithSuffix');
const addAndUpdateCommunities = require('./src/7-postAndPatchCommunities');

// This function is used to prompt the user to continue
function promptUser(message) {
    return new Promise((resolve, reject) => {
        rl.question(message, (answer) => {
            resolve(answer.trim().toLowerCase() || 'y');
        });
    });
}

// This function executes all the tasks in sequence
async function executeFunctions() {
    try {
        // Assuming these functions are synchronous, if they return promises, you'll await them.
        await startAuthentication();
        let answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await getCommunities();
        answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await updateCommunitiesFile();
        answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await generateUUIDs();
        answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await updateUUIDs();
        answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await updateNamesWithSuffix();
        answer = await promptUser('Continue to the next function? (Y/n) ');
        if (answer === 'n') return rl.close();

        await addAndUpdateCommunities();
        console.log('All functions executed successfully.');

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close(); // Ensure that the readline interface is closed at the end.
    }
}

// Start the execution
executeFunctions();
