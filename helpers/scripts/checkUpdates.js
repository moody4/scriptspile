import { attention, colors as c, cyan, green, warning } from '../libs/console.js'
import { METAFULL_FILENAME, META_DIR, META_FILENAME, SCRIPTS_DIR, TEMP_DIR } from '../libs/globals.js'
import { changeExt, checkContentPresence, checkMetaFormat, compareMetaObjects, contentSorting, createRepoAPILink, dataToContentEntry, downloadScriptsArray, fetchAsJSON, move, readJSON, removeSync, resolvePath, writeMetaFiles } from '../index.js'

const meta = await readJSON(`${META_DIR}/${META_FILENAME}`) 
const metaFull = await readJSON(`${META_DIR}/${METAFULL_FILENAME}`) 

attention(`\nCHECK UPDATES helper started...`)

cyan(`\nPREPARING TEMP DIRS:`)

console.log(`Cleaning temp dirs...`)
const updatesDir = `${TEMP_DIR}/updates`
const restoredDir = `${TEMP_DIR}/restored`
removeSync(updatesDir)
removeSync(restoredDir)
green(`Temp dirs cleaned`)

cyan(`\nPRELIMINARY CHECK:`)

if (checkMetaFormat(meta).length || checkMetaFormat(metaFull, true).length || compareMetaObjects(meta, metaFull).mismatches.length)
{
   throw new Error(warning(`There are some critical problems with metafiles. Run the integrity check to see details.`))
}

const contentPromises = []

for (const key in metaFull){
   const author = metaFull[key]
   contentPromises.push(checkContentPresence(author, { reportMissingMdPages: false }))
}

const contentDeviations = await Promise.all(contentPromises)
const downloadPromises = []

let haveWarnings = false

contentDeviations.forEach(diff => {

   const { metaEntry, missingEntries, missingPaths } = diff
   const author = metaEntry

   if (missingEntries.length) {
      haveWarnings = true
      warning(`Some of ${c.green}${author.slug}${c.red} scripts are missing, they will be redownloaded:`)

      for (const path of missingPaths) console.log(path)

      const options = { destDir: restoredDir, makeDummyMdPages: false }
      const promise = downloadScriptsArray(missingEntries, author, options)
      .then(async () => {
         await move(`${restoredDir}/${author.slug}`, `${SCRIPTS_DIR}/${author.slug}`)
      })
      
      downloadPromises.push(promise)
   } 
})

await Promise.all(downloadPromises).then(() => { 
   if (haveWarnings) console.log(`\nAll scripts restored`)
   else console.log(`No warnings`)
}).catch(err => { warning(err) })


cyan(`\nCHECK UPDATES & DOWNLOADING:`)

const processRepo = async (repo, author) => {
   
   const repoAPILink = createRepoAPILink(repo.link)
   const [response, data] = await fetchAsJSON(repoAPILink)

   if (!response.ok) {
      throw new Error(`Seems like the link doesn't exist or Github is unreachable: ${repoAPILink}`)
   }

   /* old content */
   const oldc = repo.content.sort(contentSorting)

   /* new content */
   const newc = data.flatMap(e => {
      const isFile = e.type === 'file'
      const isScript = /^js(x?)$/.test(e.name.split('.')[1])
      return isFile && isScript ? dataToContentEntry(e) : []
   }).sort(contentSorting)
   
   const updated = []
   const recent = []
   const deprecated = []
   const unchanged = []
   
   for (let i = 0, j = 0;;){
      const oldItem = oldc[i], newItem = newc[j]
      const o = oldItem.download_url, osha = oldItem.sha
      const n = newItem.download_url, nsha = newItem.sha
      if (o === n && osha !== nsha) { updated.push(newItem); i++; j++; }
      else if (o < n) { deprecated.push(oldItem); i++ }
      else if (o > n) { recent.push(newItem); j++ }
      else { unchanged.push(oldItem); i++; j++ }
      
      if (i > oldc.length-1) { recent.push(...newc.slice(j)); break }
      if (j > newc.length-1) { deprecated.push(...oldc.slice(i)); break }
   }

   const authorDir = `${SCRIPTS_DIR}/${author.slug}`

   const deprecatedPromises = deprecated.flatMap((script) => {
      const mdPage = changeExt(script.origin_name, 'md')
      const options = { silent: true }
      return [
         move(`${authorDir}/${script.origin_name}`, `${authorDir}/_deprecated/${script.origin_name}`, options),
         move(`${authorDir}/${mdPage}`, `${authorDir}/_deprecated/${mdPage}`, options),
         move(`${authorDir}/${mdPage}_`, `${authorDir}/_deprecated/${mdPage}_`, options)
      ]
   })

   await Promise.all([
      ...deprecatedPromises, 
      downloadScriptsArray(recent, author, { destDir: updatesDir }),
      downloadScriptsArray(updated, author, { destDir: updatesDir, makeDummyMdPages: false })
   ])

   const noUpdates = !updated.length && !recent.length && !deprecated.length
   console.log(`${c.green}${repo.link}${c.reset}: ${noUpdates? 'no updates' : ''}`)
   
   if (updated.length){
      for (const script of updated) console.log(`   ${c.yellow}updated: ${c.reset}${resolvePath(`${authorDir}/${script.origin_name}`)}`)
   }
   
   if (recent.length){
      for (const script of recent) console.log(`   ${c.blue}new: ${c.reset}${resolvePath(`${authorDir}/${script.origin_name}`)}`)
   }
   
   if (deprecated.length){
      for (const script of deprecated) console.log(`   ${c.red}deprecated: ${c.reset}${resolvePath(`${authorDir}/_deprecated/${script.origin_name}`)}`)
   }
   
   repo.content = [...recent, ...updated, ...unchanged]
   repo.contentLength = repo.content.length
   
   if (noUpdates) { 
      return false
   }
   else { 
      await move(`${updatesDir}/${author.slug}`, `${SCRIPTS_DIR}/${author.slug}`)
      return true 
   }
}

const reposPromises = []

console.log(`Checking repos...`)

for (const key in metaFull){
   const author = metaFull[key]
   author.ghRepoLinks.forEach((repo) => reposPromises.push(processRepo(repo, author)))
   author.lastUpdated = new Date().toISOString()
}

const haveUpdates = (await Promise.all(reposPromises)).some(e => e)

if (haveUpdates){
   cyan(`\nWRITING META FILES:`)
   
   await writeMetaFiles(metaFull)
   console.log(`Metafiles have been written:\n   ${resolvePath(`${META_DIR}/${META_FILENAME}`)}\n   ${resolvePath(`${META_DIR}/${METAFULL_FILENAME}`)}`)
   console.log(`\nUpdate completed!`) 
} else {
   console.log(`\nThere are no updates available`)
}

