import { attention, colors as c, warning } from '../libs/console.js'
import { AUTHORS_DIR, METAFULL_FILENAME, META_DIR, META_FILENAME, PUBLIC_DIR, SCRIPTS_DIR, TEMP_DIR } from '../libs/globals.js'
import { createDirSync, createReadLineInterface, escapeStr, move, pathExistsSync, readFileAsUTF8, readJSON, writeFileFromBuffer } from '../index.js'

const metaFull = await readJSON(`${META_DIR}/${METAFULL_FILENAME}`) 
const meta = await readJSON(`${META_DIR}/${META_FILENAME}`) 

attention(`\nREMOVE AUTHOR helper started, press Ctrl+C to interrupt at any moment`)

const rl = createReadLineInterface()

name: while(true) {
   const name = (await rl.question(`\nAuthor name: `)).trim()
   const slug = escapeStr(name)

   if (!name.length) {
      warning(`Name shouldn't be empty`)
      continue name
   }

   const authorPage = `${AUTHORS_DIR}/${slug}.md`
   const authorDir = `${SCRIPTS_DIR}/${slug}`
   const avatarPath = `${PUBLIC_DIR}/assets/avatar/${slug}.jpg`
   const pageExists = pathExistsSync(authorPage)
   const folderExists = pathExistsSync(authorDir)
   const avatarExists = pathExistsSync(avatarPath)
   const metaEntryExists = meta.hasOwnProperty(slug)
   const metaFullEntryExists = metaFull.hasOwnProperty(slug)
   const authorsIndexPage = await readFileAsUTF8(`${AUTHORS_DIR}/index.md`)
   const regex = new RegExp(`#\\s(?:\\[${name}\\]\\(.+\\)|\\[.+\\]\\(${slug}\\/\\))(?:.+)?(?:(?:\\r\\n|\\r|\\n)+)?`, "g")
   const indexPageEntryExists = regex.test(authorsIndexPage)

   
   if (!pageExists && !folderExists && !avatarExists && !metaEntryExists && !metaFullEntryExists && !indexPageEntryExists){
      warning(`Looks like author doesn't exist`)
      continue name
   }
   
   const rewriteIndexPage = async () => {
      const newPage = authorsIndexPage.replace(regex, "")
      return writeFileFromBuffer(`${AUTHORS_DIR}/index.md`, Buffer.from(newPage))
   }

   const tempDir = `${TEMP_DIR}/removed/${slug}`
   const backupEntry = JSON.stringify(metaFull[slug])
   
   createDirSync(tempDir)
   delete meta[slug]
   delete metaFull[slug]
   
   const options = { silent: true, overwrite: true }
   const promises = [
      move(authorPage, `${tempDir}/${slug}.md`, options),
      move(avatarPath, `${tempDir}/${slug}.jpg`, options),
      move(authorDir, `${tempDir}/scripts`, options),
      writeFileFromBuffer(`${META_DIR}/${META_FILENAME}`, Buffer.from(JSON.stringify(meta))),
      writeFileFromBuffer(`${META_DIR}/${METAFULL_FILENAME}`, Buffer.from(JSON.stringify(metaFull))),
   ]

   if (indexPageEntryExists) promises.push(rewriteIndexPage())
   if (backupEntry !== undefined) promises.push(writeFileFromBuffer(`${tempDir}/${slug}.json`, Buffer.from(backupEntry)))

   await Promise.all(promises).catch(err => { throw err })

   console.log(`All entries and files related to ${c.green}${name}${c.reset} have been removed!`)
   break
   
}

rl.close()
