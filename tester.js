const startAuthentication = require('./src/1-authenticate');
const getCommunities = require('./src/2-landingZone');
const updateCommunitiesFile = require('./src/3-communitiesOutput');
const generateUUIDs = require('./src/4-newCommunityIDs');
const updateUUIDs = require('./src/5-finalizeCommunities');
const updateNamesWithSuffix = require('./src/6-finalizeCommunitiesWithSuffix');
const addAndUpdateCommunities = require('./src/7-postAndPatchCommunities');


addAndUpdateCommunities();