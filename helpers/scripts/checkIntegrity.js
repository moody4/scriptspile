import { attention, colors as c, cyan, green, warning } from '../libs/console.js'
import { AUTHORS_DIR, METAFULL_FILENAME, META_DIR, META_FILENAME } from '../libs/globals.js'
import { checkMetaFormat, compareMetaObjects, pathExists, checkContentPresence, readJSON, resolvePath } from '../index.js'

const metaFull = await readJSON(`${META_DIR}/${METAFULL_FILENAME}`) 
const meta = await readJSON(`${META_DIR}/${META_FILENAME}`) 

const warnings = {

   _step: 0,
   _total: 0,
   
   get step () {
      const value = this._step
      this._step = 0 
      return value
   },
   get total () { 
      return this._total 
   },

   add (value = 1) {
      this._step += value
      this._total += value
   }
   
}

attention(`\nCHECK INTEGRITY helper started...`)


cyan(`\nMETA FORMAT CHECK: `)

const corruptions = [
   [META_FILENAME, checkMetaFormat(meta)], 
   [METAFULL_FILENAME, checkMetaFormat(metaFull, true)]
]

for (const [filename, results] of corruptions){
   warnings.add(results.length)
   results.forEach(key => {
      warning(`${filename} entry with key ${c.green}${key}${c.red} has incorrect format or value`)
   })
}

if (!warnings.step) green(`No warnings!`);


cyan(`\nMETA FILES COMPARISON: `)

const { haveMismatches, mismatches } = compareMetaObjects(meta, metaFull)

if (haveMismatches) {
   warning(`${META_FILENAME} and ${METAFULL_FILENAME} have unexpected differences!`)
   warnings.add(mismatches.length + 1)
   
   if (mismatches.length) {
      console.log(`\nList of mismatches:`)
      for (const item of mismatches) {
         console.log(`key: ${c.green}${item[0]}${c.reset}\n    value1: ${c.red}${item[1]}${c.reset}\n    value2: ${c.red}${item[2]}${c.reset}`)
      }
   }
}

if (!warnings.step) green(`No warnings!`)


/* Verify that authors pages and scripts exist according to meta entry.
   Also checks for redundant files in author's scripts folder */
cyan(`\nAUTHORS PAGES / SCRIPTS FILES PRESENCE CHECK:`)

const authorPagesPromises = []
const contentPromises = []

const pageExists = async (path) => {
   return Promise.resolve({ exists: await pathExists(path), path: resolvePath(path)})
}

for (const key in metaFull){
   const author = metaFull[key]
   const authorPage = `${AUTHORS_DIR}/${author.slug}.md`
   authorPagesPromises.push(pageExists(authorPage))
   contentPromises.push(checkContentPresence(author))
}

const authorPages = await Promise.all(authorPagesPromises)

authorPages.forEach(page => {
   const { exists, path } = page
   if (!exists) {
      warnings.add()
      warning(`Expected file doesn't exist: ${c.reset}${path}`)
   }
})

const contentDeviations = await Promise.all(contentPromises)

contentDeviations.forEach(diff => {
   const { missingPaths, redundantPaths } = diff
   warnings.add(missingPaths.length + redundantPaths.length)

   for (const path of missingPaths) {
      warning(`Expected file doesn't exist: ${c.reset}${path}`)
   }

   for (const path of redundantPaths) {
      warning(`Redundant file in author's scripts folder: ${c.reset}${path}`)
   }
})

if (!warnings.step) green(`No warnings!`)

console.log(`\nTotal number of warnings: ${warnings.total}`)

