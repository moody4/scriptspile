import _fs from 'fs-extra'
import _path from 'upath'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { escapeStr, trimExt, changeExt } from './utils-common.js'
import { METAFULL_FILENAME, META_DIR, META_FILENAME, SCRIPTS_DIR, TEMPLATES_DIR, TEMP_DIR } from './globals.js'

export const createReadLineInterface = () => {
   return readline.createInterface({ input, output })
}

export const isValidRepoUrl = (string) => {
   const parts = string.slice(8).split('/') 
   /* parts: [0]: 'github.com', [1]: <USER>, [2]: <REPO>, [3]: 'tree', [4]: <BRANCH>, [5...]: <SCRIPT FOLDER PATH> */
   return /^https:\/\/github\.com\/([^\/\\\.]+?)\/([^\/\\]+?)(\/|$)/.test(string) ? (Boolean(!parts[3] || parts[3] === 'tree' && parts[5]) ?? false) : false
}

export const createRepoAPILink = (repoLink) => {
   const [ _, user, repo, path ] = [...repoLink.matchAll(/^https:\/\/github\.com\/([^\/\\\.].+?)\/(.+?)(?:\/|$)(tree\/.+)?/g)][0]
   /* path (optional): tree/<BRANCH>/<SCRIPT FOLDER PATH> */
   
   let [ branch, ...folder ] = path?.split('/').slice(1) ?? ['']
   branch &&= `?ref=${branch}`
   folder = folder.length? folder.join('/').replace(/(\/+$|$)/, "/") : ''

   return `https://api.github.com/repos/${user}/${repo}/contents/${folder}${branch}`
}

export const fetchAsJSON = async (link) => {
   const response = await fetch(link);
   if (!response.ok) console.log('\n' + new Error(`Failed to fetch data, status: ${response.status}\nURL: ${response.url}`)) 
   return [response, await response.json()]
}

export const fetchAsBuffer = async (link) => {
   const response = await fetch(link);
   if (!response.ok) console.log('\n' + new Error(`Failed to fetch data, status: ${response.status}\nURL: ${response.url}`)) 
   return [response, await response.arrayBuffer()]
}

export const fetchGhUserAvatar = async (ghUser) => {
   const [response, ghUserData] = await fetchGhUserData(ghUser)
   if (!response.ok) return [response, null]
   return fetchAsBuffer(ghUserData.avatar_url)
}

export const fetchGhUserData = async (ghUser) => await fetchAsJSON(`https://api.github.com/users/${ghUser}`)

export const dataToContentEntry = (data /* script data from github api call */) => { return { name: trimExt(data.name), origin_name: data.name, path: data.path, sha: data.sha, download_url: data.download_url } }

export const downloadScriptsArray = async (scriptsEntries, metaEntry, options = {}) => {

   const {
      destDir = `${TEMP_DIR}/downloads`,
      dummyTemplatePath = `${TEMPLATES_DIR}/script-page.md`,
      makeDummyMdPages = true,
   } = options

   if (!scriptsEntries.length) return []
   const author = metaEntry
   const authorDir = `${destDir}/${author.slug}`
   createDirSync(authorDir)

   const filesPaths = scriptsEntries.flatMap(async (script) => {
      const [response, scriptContent] = await fetchAsBuffer(script.download_url)
      
      if (!response.ok) return Promise.reject(response.status)

      const promises = []
      const paths = []
      const scriptPath = `${authorDir}/${script.origin_name}`
      paths.push(scriptPath)
      promises.push(writeFileFromBuffer(scriptPath, scriptContent))

      if (makeDummyMdPages) {
         const scriptPageDummy = readFileAsUTF8Sync(dummyTemplatePath).replace(
            /(<SCRIPT_NAME>)|(<FILE_NAME>)|(<AUTHOR_NAME>)/g, (m, $1, $2, $3) => {
               switch(m){
                  case $1: return script.name
                  case $2: return script.origin_name
                  case $3: return author.name
               }})
         const dummyPagePath = `${authorDir}/${script.name}.md_`
         paths.push(dummyPagePath)
         promises.push(writeFileFromBuffer(dummyPagePath, Buffer.from(scriptPageDummy)))
      }

      await Promise.all(promises)
      return paths

   })

   await Promise.all(filesPaths).catch((err) =>{ throw new Error(`Failed to download some files, reason: ${err}`) })
   return { author, paths: await filesPaths }

}

export const checkContentPresence = async (metaEntry, options = {}) => {

   const { 
      reportMissingMdPages = true 
   } = options

   const author = metaEntry
   const authorDir = `${SCRIPTS_DIR}/${author.slug}`
   const files = await getFiles(authorDir, { ignore: ['assets', '_deprecated'] })
   const filesList = new Set(files)
   const missingPaths = []
   const missingEntries = []
   
   for (const repo of author.ghRepoLinks){
      repo.content.forEach((script) => {
         const scriptPath = resolvePath(`${authorDir}/${script.origin_name}`)
         const mdPath = changeExt(scriptPath, 'md')

         if (!filesList.delete(scriptPath)/* bool check if file exists */) {
            missingPaths.push(scriptPath)
            missingEntries.push(script)
         }

         if (!filesList.delete(mdPath) && !filesList.delete(`${mdPath}_`)){
            if (reportMissingMdPages) missingPaths.push(mdPath)
         }
      })
   }
         /* object, array of objects, array of strings, array of strings */
   return { metaEntry, missingEntries , missingPaths , redundantPaths: [...filesList] }

}

/* Unidirectional comparison: additional properties of obj2 that are missing in obj1 are not considered a mismatch.
   Only missing properties in obj2 or mismatched primitive value counts */
export const compareObjects = (obj1, obj2, root = 'object') => {
   let mismatches = []

   for (const key in obj1) {
      if (obj2[key] === undefined) {
         mismatches.push([`${root}.${key}`, obj1[key], undefined])
      } else if (typeof obj1[key] === 'object') {
         mismatches = mismatches.concat(compareObjects(obj1[key], obj2[key], `${root}.${key}`))
      } else if (obj2[key] !== obj1[key]) {
         mismatches.push([`${root}.${key}`, obj1[key], obj2[key]])
      }
   }

   return mismatches
}
   
export const compareMetaObjects = (meta, metaFull) => {
   /* Clone metaFull and compare objects strict as strings
   Not sure if this is required, especially performance-wise */
   const clone = structuredClone(metaFull)
   Object.keys(clone).forEach(key => clone[key].ghRepoLinks.forEach(r => delete r.content))
   const haveMismatches = JSON.stringify(meta) !== JSON.stringify(clone)
   
   const mismatches = []

   if (haveMismatches){
      const metaLength = Object.keys(meta).length
      const metaFullLength = Object.keys(metaFull).length
      if (metaLength !== metaFullLength) mismatches.push(['Number of entries', metaLength, metaFullLength])

      mismatches.push(...compareObjects(meta, metaFull, 'meta'))

      for (const key in meta){
         const l = meta[key]?.ghRepoLinks?.length
         const l2 = metaFull[key]?.ghRepoLinks?.length
         if (l !== l2) mismatches.push([`meta.${key}.ghRepoLinks.length`, l, l2])
      }
   } 

   return { haveMismatches, mismatches }
}

export const isMetaCorrect = (entry, entryKey, fullFormat = false) => {

   const isContentEntryCorrect = (entry) => {
      return (
         typeof entry === 'object' &&
         entry.hasOwnProperty('name') &&
         entry.hasOwnProperty('origin_name') &&
         entry.hasOwnProperty('path') &&
         entry.hasOwnProperty('sha') &&
         entry.hasOwnProperty('download_url')
         )
   }
   
   const isRepoEntryCorrect = (entry) => {
      return (
               typeof entry === 'object' &&
               entry.hasOwnProperty('link') &&
               entry.hasOwnProperty('contentLength') &&
               isValidRepoUrl(entry.link) &&
               (!fullFormat || (entry.hasOwnProperty('content') && entry.content.every(e => isContentEntryCorrect(e))))
               )
   }

   return (
            typeof entry === 'object' &&
            entry.hasOwnProperty('name') &&
            entry.hasOwnProperty('slug') &&
            entry.hasOwnProperty('ghUser') &&
            entry.hasOwnProperty('ghRepoLinks') &&
            entry.hasOwnProperty('lastUpdated') &&
            entry.slug === escapeStr(entry.name) &&
            entryKey === entry.slug &&
            (!entry.ghRepoLinks.length || entry.ghRepoLinks.every(r => isRepoEntryCorrect(r)))
            )

}

export const checkMetaFormat = (jsonObj, fullFormat = false) => {
   const corruptions = []
   for (const key in jsonObj) {
      if(!isMetaCorrect(jsonObj[key], key, fullFormat)) {
         corruptions.push(key)
      }
   }
   return corruptions
}

export const contentSorting = (a, b) => {
   a = a.download_url, b = b.download_url
   return a === b ? 0 : (a < b ? -1 : 1)
}

export const writeMetaFiles = async (metaFull) => {
   Object.keys(metaFull).forEach(key => metaFull[key].ghRepoLinks.forEach(repo => repo.content.sort(contentSorting)))
   const metaFullPromise = writeFileFromBuffer(`${META_DIR}/${METAFULL_FILENAME}`, Buffer.from(JSON.stringify(metaFull)))
   Object.keys(metaFull).forEach(key => metaFull[key].ghRepoLinks.forEach(repo => delete repo.content))
   const metaPromise = writeFileFromBuffer(`${META_DIR}/${META_FILENAME}`, Buffer.from(JSON.stringify(metaFull)))
   
   return await Promise.all([metaFullPromise, metaPromise]).catch(err => { throw err })
}

export const pathExists = async (path) => {
   return _fs.pathExists(resolvePath(path)).catch(err => { throw err })
}

export const readJSON = async (path) => {
   return _fs.readJson(resolvePath(path)).catch(err => { throw err })
 }

export const readFileAsUTF8 = async (relativePath) => {
   return _fs.readFile(resolvePath(relativePath), { encoding: 'utf8'}).catch(err => { throw err })
}

export const remove = async (path) => { 
   return _fs.remove(resolvePath(path)).catch (err => { throw err })
}

export const writeFileFromBuffer = async (relativePath, data) => {
   return _fs.writeFile(resolvePath(relativePath), new Uint8Array(data)).catch(err => { throw err })
}

export const move = async (sourcePath, destPath, options = {}) => {

   const {
      overwrite = false, /* option for moving folders, separate files will be overwritten regardless */
      keepSource = false,
      silent = false /* when false, will throw error if source doesn't exist */
   } = options

   const source = resolvePath(sourcePath)
   const dest = resolvePath(destPath)

   const exists = _fs.pathExistsSync(source)

   if (exists) {
      if (overwrite) _fs.removeSync(dest)
      _fs.copySync(source, dest)
      if (!keepSource) _fs.removeSync(source)
   } else {
      if (!silent) throw new Error(`No such file or folder: ${source}`)
   }
      
}

export const readFileAsUTF8Sync = (relativePath) => {
   try { return _fs.readFileSync(resolvePath(relativePath), { encoding: 'utf8'}) }
   catch (err) { throw err }
} 

export const createDirSync = (relativePath) => {
   try { _fs.mkdirSync(resolvePath(relativePath), { recursive: true }) } 
   catch (err) { throw err }
}

export const removeSync = (path) => { 
   try { _fs.removeSync(resolvePath(path)) }
   catch (err) { throw err }
}

export const pathExistsSync = (path) => _fs.pathExistsSync(resolvePath(path))

export const resolvePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url))

export const getFiles = async (dir, options = {}) => {
   const {
      recursive = true,
      filesExt = [], /* array of strings */
      ignore = [] /* array of strings */
   } = options

   const dirent = await _fs.readdir(resolvePath(dir), { withFileTypes: true })
   
   const files = await Promise.all(dirent.map((entry) => {
      const path = resolvePath(`${dir}/${entry.name}`)
      if (ignore.some(str => path.endsWith(str))) return []
      if (entry.isDirectory()) {
         return recursive? getFiles(pathToFileURL(path), options) : []
      } else if (filesExt.length) {
         return filesExt.some(ext => `.${ext}` === _path.extname(path)) ? path : [];
      } else {
         return path
      }
   }))

   return [].concat(...files)

 }
 