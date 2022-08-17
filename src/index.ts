/* Matrix bot to prevent spam passively by following some principles. */

import { ModRoom, UserRoom } from './types'

import { UserConfig } from './config/user'
import { ConfigHandler } from './config/handler'
import { ModPermission } from './functions/mod'

import { Command } from 'commander'
import {
  MatrixClient,
  AutojoinRoomsMixin,
  SimpleFsStorageProvider
} from 'matrix-bot-sdk'

import winston from 'winston'

const logger : winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'execution.log' })
  ]
})

const programParser = new Command()

programParser
  .name('matrix-spam-bot')
  .description('Prevents spam by following some principles')
  .version('0.1.0')

programParser
  .requiredOption('-sv, --server-name <value>', 'Defines the matrix server in which the bot will work on.')
  .requiredOption('-act, --access-token <value>', 'Defines the Bot access-token to the server.')
  .requiredOption('-bn, --bot-name <value>', 'Defines the matrix name, use as: [@mybot:matrix.org].')
  .option('-mm, --master-mod <value>', 'Specifies the master mod to be added to the config.')

programParser.parse(process.argv)

const parseOptions = programParser.opts()
const userConfig = new UserConfig(
  parseOptions.serverName,
  parseOptions.accessToken,
  parseOptions.botName,
  parseOptions.masterMod
)

const storage : SimpleFsStorageProvider = new SimpleFsStorageProvider('bot.json')
const client : MatrixClient = new MatrixClient(
  userConfig.SERVER_NAME,
  userConfig.ACCESS_TOKEN,
  storage
)

const configHandler = new ConfigHandler(
  userConfig.DEFAULT_CONFIG_FILE,
  userConfig.MASTER_MOD
)
const modPermission = new ModPermission()

// By default, it join rooms automatically.
AutojoinRoomsMixin.setupOnClient(client)

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
        logger.info('The user power level was set')
      }
    )

    const specificRoomId : number = configHandler.returnSpecificRoom(roomId)
    const user : UserRoom = {} as UserRoom

    user.name = userName
    user.entryTime = Date.now()

    configHandler.config.modRoom[specificRoomId].users.push(user)
  }
})

client.on('room.message', (roomId: string, event: any) => {
  // Avoids that the own message is interpreted.
  if (event.sender === userConfig.BOT_NAME) return
  if (!event.content) return

  const message : string = event.content.body
  const sender : string = event.sender

  if (message.startsWith(userConfig.COMMAND_CHARACTER)) {
    // Find the correspondent config room
    const roomIndex : number = configHandler.returnSpecificRoom(roomId)
    let room : ModRoom = {} as ModRoom

    if (roomIndex === -1) {
      // In this case the room does not exists
      room = {
        id: roomId,
        mods: [configHandler.config.masterMod],
        users: []
      }

      configHandler.config.modRoom.push(room)
      logger.warn('The room with id ' + roomId.toString() + ' was not found. Creating new one.')
    } else {
      room = configHandler.config.modRoom[roomIndex]
    }

    if ((roomIndex && room.mods.includes(sender)) || configHandler.config.masterMod === sender) {
      // The issuer is a mod guarantee.
      if (message.startsWith('!addmod')) {
        modPermission.addMod(message, configHandler, roomId, client)
      } else if (message.startsWith('!removemod')) {
        modPermission.removeMod(message, configHandler, roomId, client)
      } else if (message.startsWith('!listmod')) {
        modPermission.listMod(configHandler, client, roomId)
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
