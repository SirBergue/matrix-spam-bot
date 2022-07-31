/* Matrix bot to prevent spam passively by following some principles. */

import * as userConfigs from './config/userConfigs'

import {
  ConfigHandler
} from './config/handler'

import {
  MatrixClient,
  AutojoinRoomsMixin,
  SimpleFsStorageProvider
} from 'matrix-bot-sdk'

const storage : SimpleFsStorageProvider = new SimpleFsStorageProvider('bot.json')
const client : MatrixClient = new MatrixClient(
  userConfigs.SERVER_NAME,
  userConfigs.ACCESS_TOKEN,
  storage
)

// By default, it join rooms automatically.
AutojoinRoomsMixin.setupOnClient(client)

const configHandler = new ConfigHandler(
  userConfigs.DEFAULT_CONFIG_FILE,
  userConfigs.INITIAL_MOD
)

configHandler.verifyConfig()

// Admits that an user entered in the chat.
client.on('m.room.member', (roomId: string, event: any) => {
  // Note: this applies to clients invited too.
  console.log(event)
  if (event.content.membership === 'join') {
    // That guarantees this is a invite.
    const userName: string = event.sender

    client.setUserPowerLevel(userName, roomId, -1).then(
      function () {
        console.log('Here')
      }
    )
  }
  // if (event['sender'] == BOT_NAME) return

  // let userName : string = event['sender']

  // client.sendStateEvent(roomId, 'm.room.power_levels', '', {
  //     'users': { userName: -1 },
  // })
})

client.on('room.message', (roomId: string, event: any) => {
  // Avoids that the own message is interpreted.
  if (event.sender === userConfigs.BOT_NAME) return
  if (!event.content) return

  const message : string = event.content.body
  const sender : string = event.sender

  if (message.startsWith(userConfigs.COMMAND_CHARACTER)) {
    if (configHandler.config.mods.includes(sender)) {
      // The issuer is a mod guarantee.

      if (message.startsWith('!addmod')) {
        // Adds an user to the config input.
        const modName : string | undefined = message.split(' ').pop()
        if (modName) {
          configHandler.config.mods.push(modName.toString())

          client.sendMessage(roomId, {
            msgtype: 'm.room.message',
            body: 'Mod: ' + modName.toString() + ' has been added.'
          })
        }
      } else if (message.startsWith('!removemod')) {
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
      } else if (message.startsWith('!listmod')) {
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
    } else {
      client.sendMessage(roomId, {
        msgtype: 'm.room.message',
        body: sender + ' you do not have permission to do that.'
      })
    }
  }
})

process.on('SIGINT', () => {
  console.log('Caught interrupt signal')
  configHandler.saveConfigFile()

  process.exit()
})

client.start().then(
  function () {
    console.log('Client started!')
  }
)
