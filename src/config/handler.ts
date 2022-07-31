/* Handles the configuration-state by using json. */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export class ConfigHandler {
    configuration_path : string;
    initial_mod : string;

    config : { [mods: string] : string[] };

    constructor(configuration_path: string, initial_mod: string) {
        this.configuration_path = configuration_path;
        this.initial_mod = initial_mod;
        this.config = {};
    }

    verifyConfig() : void {
        let shouldCreateConfig : boolean = false;

        if (existsSync(this.configuration_path)) {
            const data : Buffer = readFileSync(this.configuration_path);
            if (data) {
                this.config = JSON.parse(data.toString());
                console.log("Succesfuly loaded config from disk.")
            } else { shouldCreateConfig = true; }

        } else { shouldCreateConfig = true }

        // In case the file does not exists.
        if (shouldCreateConfig) {
            this.config = { mods: [this.initial_mod], }

            writeFileSync(
                this.configuration_path, 
                JSON.stringify(this.config, null, 2),
                'utf8'
            );

            console.log("Succesfuly created config file.");
        }
    }

    saveConfigFile() : void {
        if (existsSync(this.configuration_path)) {
            // It's safe to assume that the config exists.
            writeFileSync(this.configuration_path, JSON.stringify(this.config, null, 2));
            console.log("Saving the config file.")
        }
    }
}