export type ModRoom = {
    id : string,
    mods : string[]
}

export type Config = {
    modRoom : ModRoom[],
    masterMod : string
}
