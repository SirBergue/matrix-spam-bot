/* Handles the mods permissions */

import { MatrixClient } from 'matrix-bot-sdk'
import { ConfigHandler } from '../config/handler'

export class ModPermission {
  addMod (message : string,
    configHandler : ConfigHandler,
    roomId : string,
    client : MatrixClient) : void {
    // Adds an user to the config input.
    const modName : string | undefined = message.split(' ').pop()

    if (modName) {
      configHandler.config.mods.push(modName.toString())
      client.sendMessage(roomId, {
        msgtype: 'm.room.message',
        body: 'Mod: ' + modName.toString() + ' has been added.'
      })
    }
  }

  removeMod (message : string,
    configHandler : ConfigHandler,
    roomId : string,
    client : MatrixClient) : void {
    // TODO: Add remove mod option.
    const modName : string | undefined = message.split(' ').pop()

    if (modName) {
      const modNameIndex : number = configHandler.config.mods.indexOf(modName, 0)

      // Guarantees that the mods exists in mod list.
      if (modNameIndex !== -1) {
        configHandler.config.mods.splice(modNameIndex, 1)

        client.sendMessage(roomId, {
          msgtype: 'm.room.message',
          body: 'Mod: ' + modName.toString() + ' has been removed.'
        })
      }
    }
  }

  listMod (configHandler : ConfigHandler,
    client : MatrixClient,
    roomId : string) : void {
    let modListString = 'The mods in my list are:\n\n'
    for (const modNameIndex in configHandler.config.mods) {
      modListString += configHandler.config.mods[modNameIndex] + '\n'
    }

    client.sendMessage(roomId, {
      msgtype: 'm.room.message',
      format: 'org.matrix.custom.html',
      body: modListString
    })
  }
}
