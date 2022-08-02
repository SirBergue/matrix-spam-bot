/* Handles the mods permissions */

import { MatrixClient } from 'matrix-bot-sdk'
import { ConfigHandler } from '../config/handler'
import { ModRoom } from '../types'

export class ModPermission {
  addMod (message : string,
    configHandler : ConfigHandler,
    roomId : string,
    client : MatrixClient) : void {
    // Adds an user to the config input.
    const modName : string | undefined = message.split(' ').pop()

    if (modName) {
      let doesRoomExists : boolean = false

      for (const room in configHandler.config.modRoom) {
        if (configHandler.config.modRoom[room].id === roomId) {
          configHandler.config.modRoom[room].mods.push(modName.toString())
          doesRoomExists = true
          break
        }
      }

      if (!doesRoomExists) {
        const newRoom : ModRoom = {
          id: roomId,
          mods: [configHandler.config.masterMod, modName]
        }

        configHandler.config.modRoom.push(newRoom)
      }

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

    const roomIndex : number = configHandler.returnSpecificRoom(roomId)
    const room : ModRoom = configHandler.config.modRoom[roomIndex]

    if (modName) {
      const modNameIndex : number = room.mods.indexOf(modName, 0)

      // Guarantees that the mods exists in mod list.
      if (modNameIndex !== -1) {
        configHandler.config.modRoom[roomIndex].mods.splice(modNameIndex, 1)

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
    let modListString : string = 'The mods in my list are:\n\n'

    const roomIndex : number = configHandler.returnSpecificRoom(roomId)
    const room : ModRoom = configHandler.config.modRoom[roomIndex]

    for (const modNameIndex in room.mods) {
      modListString += room.mods[modNameIndex] + '\n'
    }

    client.sendMessage(roomId, {
      msgtype: 'm.room.message',
      format: 'org.matrix.custom.html',
      body: modListString
    })
  }
}
