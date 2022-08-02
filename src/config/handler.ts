/* Handles the configuration-state by using json. */

import { Config } from '../types'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

export class ConfigHandler {
  // The config is set per room.
  configurationPath : string
  config : Config

  constructor (configurationPath: string, masterMod: string) {
    this.configurationPath = configurationPath

    this.config = {} as Config
    this.config.masterMod = masterMod
  }

  verifyConfig () : void {
    let shouldCreateConfig : boolean = false

    if (existsSync(this.configurationPath)) {
      const data : Buffer = readFileSync(this.configurationPath)
      if (data) {
        const preConfig : Config = JSON.parse(data.toString())

        // Prioritizes the specified parameter value than the saved file value.
        if (this.config.masterMod) {
          if (preConfig.masterMod !== this.config.masterMod) {
            preConfig.masterMod = this.config.masterMod
          }
        }

        this.config = preConfig
        console.log('Successfuly loaded config from disk.')
      } else { shouldCreateConfig = true }
    } else { shouldCreateConfig = true }

    // In case the file does not exists or is invalid.
    if (shouldCreateConfig) {
      writeFileSync(
        this.configurationPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      )

      console.log('Successfuly created config file.')
    }
  }

  saveConfigFile () : void {
    if (existsSync(this.configurationPath)) {
      // It's safe to assume that the config exists.
      writeFileSync(this.configurationPath, JSON.stringify(this.config, null, 2))
      console.log('Saving the config file.')
    }
  }

  returnSpecificRoom (roomId : string) : number {
    let i = 0

    for (const room in this.config.modRoom) {
      if (this.config.modRoom[room].id === roomId) {
        return i
      }
      i += 1
    }

    return -1
  }
}
