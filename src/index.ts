/* Matrix bot to prevent spam passively by following some principles. */

import {
    MatrixClient,
    AutojoinRoomsMixin,
    SimpleFsStorageProvider
} from "matrix-bot-sdk";

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SERVER_NAME : string       = "https://server.name";
const ACCESS_TOKEN : string      = "ENTER_BOT_ACCESS_KEY";
const BOT_NAME : string          = "@BOT_NAME:server.name";
const INITIAL_MOD : string       = "@YOUR_NAME:your_server.name";

const COMMAND_CHARACTER : string   = "!";
const DEFAULT_CONFIG_FILE : string = "./bot_config.json";

const storage : SimpleFsStorageProvider = new SimpleFsStorageProvider("bot.json");
const client : MatrixClient = new MatrixClient(
    SERVER_NAME,
    ACCESS_TOKEN,
    storage
);

var config : { [mods: string] : string[] };

function verifyConfig() : void {
    let shouldCreateConfig : boolean = false;

    if (existsSync(DEFAULT_CONFIG_FILE)) {
        const data : Buffer = readFileSync(DEFAULT_CONFIG_FILE);
        if (data) {
            config = JSON.parse(data.toString());
            console.log("Succesfuly loaded config from disk.")
        } else { shouldCreateConfig = true; }

    } else { shouldCreateConfig = true }

    // In case the file does not exists.
    if (shouldCreateConfig) {
        config = {
            mods: [INITIAL_MOD],
        }

        writeFileSync(
            DEFAULT_CONFIG_FILE, 
            JSON.stringify(config, null, 2),
            'utf8'
        );

        console.log("Succesfuly created config file.");
    }
}

function saveConfigFile() : void {
    if (existsSync(DEFAULT_CONFIG_FILE)) {
        // It's safe to assume that the config exists.
        writeFileSync(DEFAULT_CONFIG_FILE, JSON.stringify(config, null, 2));
    }
}

// By default, it join rooms automatically.
AutojoinRoomsMixin.setupOnClient(client);

verifyConfig();

client.on("room.message", (roomId, event) => {
    // Avoids that the own message is interpreted.
    if (event["sender"] == BOT_NAME) return;
    if (!event["content"]) return;

    let message : string = event["content"]["body"];
    let sender  : string = event["sender"];

    if (message.startsWith(COMMAND_CHARACTER)) {
        if (config["mods"].includes(sender)) {
            // The issuer is a mod guarantee.
            
            if (message.startsWith("!addmod")) {
                // Adds an user to the config input.
                let modName : string | undefined = message.split(" ").pop();
                if (modName) { config["mods"].push(modName.toString()); }
            } else if (message.startsWith("!removemod")) {
                // TODO: Add remove mod option.
                let modName : string | undefined = message.split(" ").pop();
                if (modName) { 
                    const modNameIndex : number = config["mods"].indexOf(modName, 0);
                    // Guarantees that the mods exists in mod list.
                    if (modNameIndex !== -1) { config["mods"].splice(modNameIndex, 1); }
                };
            }
        }
    }

});

try {
    client.start().then(() => console.log("Client started!"));
} catch (err) {
    saveConfigFile();
}
