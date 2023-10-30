const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config.json');

const BASE_URL = config.targetSystem.baseREST;
const AUTH = {
    username: config.targetSystem.username,
    password: config.targetSystem.password
};

axios.defaults.auth = AUTH;

const sourceDir = path.join(__dirname, '..', config.targetSystem.sourceDir);
const ASSET_MAPPINGS_FILE = path.join(sourceDir, 'assetMappings.json');

const getFiles = (srcPath, filter) => {
    return fs.readdirSync(srcPath).filter(file => file.startsWith(filter));
};

const saveMappings = (mappings) => {
    fs.writeFileSync(ASSET_MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
};

const migrateAssets = async () => {
    const assetFiles = getFiles(sourceDir, "assets_");
    let assetMappings = {};

    console.log(`Starting migration...`);
    console.log(`Total asset files to process: ${assetFiles.length}`);

    if (fs.existsSync(ASSET_MAPPINGS_FILE)) {
        assetMappings = JSON.parse(fs.readFileSync(ASSET_MAPPINGS_FILE, 'utf8'));
    }

    for (let index = 0; index < assetFiles.length; index++) {
        const assetFile = assetFiles[index];
        console.log(`Processing file ${index + 1}/${assetFiles.length}: ${assetFile}`);
        
        const assets = JSON.parse(fs.readFileSync(path.join(sourceDir, assetFile), 'utf8'));
        const postPayload = [];

        for (const asset of assets) {
            const newUUID = uuidv4();
            assetMappings[asset.id] = newUUID;

            postPayload.push({
                id: newUUID,
                name: asset.name,
                displayName: asset.displayName,
                domainId: asset.domainId,
                typeId: asset.typeId,
                statusId: "00000000-0000-0000-0000-000000005008"
            });

            if (postPayload.length === 1000) {
                console.log(`Sending batch of ${postPayload.length} assets...`);
                await axios.post(`${BASE_URL}/assets/bulk`, postPayload);
                postPayload.length = 0;
            }
        }

        if (postPayload.length > 0) {
            console.log(`Sending final batch of ${postPayload.length} assets for file ${assetFile}...`);
            await axios.post(`${BASE_URL}/assets/bulk`, postPayload);
        }

        saveMappings(assetMappings);
    }

    console.log('Migration completed!');
};



module.exports = migrateAssets;
