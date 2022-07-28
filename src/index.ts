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
        console.log("Saving the config file.")
    }
}

// By default, it join rooms automatically.
AutojoinRoomsMixin.setupOnClient(client);

verifyConfig();

// Admits that an user entered in the chat.
client.on("m.room.member", (roomId: string, event: any) => {
    // Note: this applies to clients invited too.
    console.log(event)
    if (event["content"]["membership"] == 'join') {
        // That guarantees this is a invite.
        let userName: string = event["sender"];
        client.setUserPowerLevel(userName, roomId, -1).then(
            function() {
                console.log("Here")
            }
        )
    }
    // if (event["sender"] == BOT_NAME) return;

    // let userName : string = event["sender"];

    // client.sendStateEvent(roomId, "m.room.power_levels", "", {
    //     "users": { userName: -1 },      
    // });
});

client.on("room.message", (roomId: string, event: any) => {
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
                if (modName) { 
                    config["mods"].push(modName.toString()); 

                    client.sendMessage(roomId, {
                        "msgtype": "m.room.message",
                        "body": "Mod: " + modName.toString() + " has been added.",
                    });
                }
            } else if (message.startsWith("!removemod")) {
                // TODO: Add remove mod option.
                let modName : string | undefined = message.split(" ").pop();
                if (modName) { 
                    const modNameIndex : number = config["mods"].indexOf(modName, 0);
                    // Guarantees that the mods exists in mod list.
                    if (modNameIndex !== -1) {
                         config["mods"].splice(modNameIndex, 1);
                         client.sendMessage(roomId, {
                            "msgtype": "m.room.message",
                            "body": "Mod: " + modName.toString() + " has been removed.",
                        });
                    }
                };
            } else if (message.startsWith("!listmod")) {
                let mod_list_string = "The mods in my list are:\n\n";
                for (let modNameIndex  in config["mods"]) { mod_list_string += config["mods"][modNameIndex] + '\n' }

                client.sendMessage(roomId, {
                    "msgtype": "m.room.message",
                    "format": "org.matrix.custom.html",
                    "body": mod_list_string,
                });
            }
        }
        else {
            client.sendMessage(roomId, {
                "msgtype": "m.room.message",
                "body": sender + " you do not have permission to do that.",
            });
        }
    }

});

process.on('SIGINT', () => {
    console.log("Caught interrupt signal");
    saveConfigFile();
    process.exit()
});

client.start().then(
    function() {
        console.log("Client started!")
    } 
);