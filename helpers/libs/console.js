export const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m"
}

export const warning = (text) => console.log(`${colors.red}${text}${colors.reset}`)

export const attention = (text) => console.log(`${colors.yellow}${text}${colors.reset}`)

export const error = (text) => console.log(new Error(`${colors.red}${text}${colors.reset}`))

export const cyan = (text) => console.log(`${colors.cyan}${text}${colors.reset}`)

export const green = (text) => console.log(`${colors.green}${text}${colors.reset}`)

export const red = (text) => console.log(`${colors.red}${text}${colors.reset}`)

export const blue = (text) => console.log(`${colors.blue}${text}${colors.reset}`)

export const yellow = (text) => console.log(`${colors.yellow}${text}${colors.reset}`)
