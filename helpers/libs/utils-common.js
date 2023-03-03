import _path from 'upath'

export const escapeStr = (string) => string.toLowerCase().replace(/\s/g, '-')

export const trimExt = (fileName) => _path.trimExt(fileName)

export const changeExt = (fileName, ext) => _path.changeExt(fileName, ext)
