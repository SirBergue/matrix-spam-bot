export type UserRoom = {
    name : string,
    entryTime : number
}

export type ModRoom = {
    id : string,
    mods : string[],
    users : UserRoom[]
}

export type Config = {
    modRoom : ModRoom[],
    masterMod : string
}
