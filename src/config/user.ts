/* General bot tweaking configs */

export class UserConfig {
  SERVER_NAME : string
  ACCESS_TOKEN : string
  BOT_NAME : string
  MASTER_MOD : string

  COMMAND_CHARACTER : string
  DEFAULT_CONFIG_FILE : string

  constructor (
    SERVER_NAME : string,
    ACCESS_TOKEN : string,
    BOT_NAME : string,
    MASTER_MOD : string) {
    this.SERVER_NAME = SERVER_NAME
    this.ACCESS_TOKEN = ACCESS_TOKEN
    this.BOT_NAME = BOT_NAME

    // Admits an empty master mod.
    if (MASTER_MOD) {
      this.MASTER_MOD = MASTER_MOD
    } else {
      this.MASTER_MOD = ''
    }

    this.COMMAND_CHARACTER = '!'
    this.DEFAULT_CONFIG_FILE = './bot_config.json'
  }
}
