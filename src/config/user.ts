/* General bot tweaking configs */

export class UserConfig {
  SERVER_NAME : string
  ACCESS_TOKEN : string
  BOT_NAME : string
  INITIAL_MOD : string

  COMMAND_CHARACTER : string
  DEFAULT_CONFIG_FILE : string

  constructor (
    SERVER_NAME : string,
    ACCESS_TOKEN : string,
    BOT_NAME : string,
    INITIAL_MOD : string) {
    this.SERVER_NAME = SERVER_NAME
    this.ACCESS_TOKEN = ACCESS_TOKEN
    this.BOT_NAME = BOT_NAME

    // Admits an empty initial mod
    if (INITIAL_MOD) {
      this.INITIAL_MOD = INITIAL_MOD
    } else {
      this.INITIAL_MOD = ''
    }

    this.COMMAND_CHARACTER = '!'
    this.DEFAULT_CONFIG_FILE = './bot_config.json'
  }
}
