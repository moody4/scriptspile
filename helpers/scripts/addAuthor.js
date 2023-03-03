import { attention, colors as c, cyan, green, warning } from '../libs/console.js'
import { AUTHORS_DIR, METAFULL_FILENAME, META_DIR, META_FILENAME, PUBLIC_DIR, SCRIPTS_DIR, TEMPLATES_DIR, TEMP_DIR } from '../libs/globals.js'
import { createDirSync, createReadLineInterface, createRepoAPILink, dataToContentEntry, downloadScriptsArray, escapeStr, fetchAsJSON, fetchGhUserAvatar, isValidRepoUrl, move, readFileAsUTF8, readJSON, resolvePath, writeFileFromBuffer, writeMetaFiles } from '../index.js'

const metaFull = await readJSON(`${META_DIR}/${METAFULL_FILENAME}`) 
const meta = await readJSON(`${META_DIR}/${META_FILENAME}`) 

attention(`\nADD AUTHOR helper started, press Ctrl+C to interrupt at any moment`);

const rl = createReadLineInterface()

const author = {
   name: undefined,
   slug: undefined,
   ghUser: undefined,
   ghRepoLinks: []
}

const tempDir = `${TEMP_DIR}/add`

let scriptsCounter = 0

name: while (true) {

   const name = (await rl.question(`\nAuthor name: `)).trim()
   const slug = escapeStr(name)

   if (!name.length) {
      warning(`Name shouldn't be empty`)
      continue name
   }

   if (meta.hasOwnProperty(slug)){
      warning(`Looks like author entry already exists:`)
      console.log(`${JSON.stringify(meta[slug]).slice(0, 400)}...\n`)
      continue name
   }

   author.name = name
   author.slug = slug
   break

}

repo: while (true) {

   const question = !author.ghRepoLinks.length ? 'Enter repo link: ' : 'Another repo? Enter link or leave empty to proceed: '
   const link = (await rl.question(question)).trim().replace(/(?<!https:)\/{2,}|([^\/\s])$/g, "$1/")

   if (author.ghRepoLinks.length && !link.length) break /* If one repo already added and input is empty, exit loop */

   if (!isValidRepoUrl(link)) {
      warning(
         `\nInvalid link! ${c.white}Correct formats:\n` +
         `   https://github.com/<GITHUB_USER>/<REPO>,\n` +
         `   https://github.com/<GITHUB_USER>/<REPO>/tree/<BRANCH>/<SCRIPT FOLDER>\n`
      )
      continue repo
   }

   if (author.ghRepoLinks.some(r => r.link === link)) continue repo

   const ghUser = link.slice(8).split('/')[1]

   if (author.ghRepoLinks.length && author.ghUser !== ghUser){
      warning(`Repo belongs to a different Github account: "${ghUser}", but it should be "${author.ghUser}"\n`)
      continue repo
   }
   
   const repoAPILink = createRepoAPILink(link)
   const [response, data] = await fetchAsJSON(repoAPILink)

   if (!response.ok) {
      warning(`Seems like the link doesn't exist or Github is unreachable\n`)
      continue repo
   }

   const content = data.flatMap(e => {
      const isFile = e.type === 'file'
      const isScript = /^js(x?)$/.test(e.name.split('.')[1])
      return isFile && isScript ? dataToContentEntry(e) : []
   })

   if (!content.length){
      warning(`Repo directory does not contain any .jsx or .js files!\n`)
      continue repo
   }

   author.ghRepoLinks.push({ link: link, content: content, contentLength: content.length})
   author.ghUser = ghUser
   scriptsCounter += content.length
   continue repo

}

cyan(`
The following would be created:
   Author page at: ${c.white}${resolvePath(`${AUTHORS_DIR}/${author.slug}.md`)}${c.cyan}
   Folder with ${c.white}${scriptsCounter}${c.cyan} downloaded scripts at: ${c.white}${resolvePath(`${SCRIPTS_DIR}/${author.slug}`)}${c.cyan}
   Github avatar at: ${c.white}${resolvePath(`${PUBLIC_DIR}/assets/avatar/${author.slug}.jpg`)}${c.cyan}
   JSON entry with the following properties:`)

console.dir(author, { depth: 2 })

const fetchScripts = () => {
   return author.ghRepoLinks.map(async (r) => {
      const options = { destDir: tempDir, makeDummyMdPages: true }
      await downloadScriptsArray(r.content, author, options)
   })
}

const fetchAvatar = async () => {
   const [response, buffer] = await fetchGhUserAvatar(author.ghUser)

   if (response.ok) {
      return writeFileFromBuffer(`${PUBLIC_DIR}/assets/avatar/${author.slug}.jpg`, buffer)
   } else {
      warning(`Failed to download Github user avatar!`)
   }
}

const createDummyPage = async () => {
   const authorPageDummy = (await readFileAsUTF8(`${TEMPLATES_DIR}/author-page.md`)).replace(
      /(<AUTHOR_NAME>)|(<GITHUB_USER>)/g, (m, $1, $2) => {
         switch(m){
            case $1: return author.name
            case $2: return author.ghUser
         }
      })
   return writeFileFromBuffer(`${AUTHORS_DIR}/${author.slug}.md`, Buffer.from(authorPageDummy))
}

const addToAuthorsIndexPage = async () => {
   const indexPage = await readFileAsUTF8(`${AUTHORS_DIR}/index.md`)
   const carry = indexPage.match(/(?:\r\n|\r|\n)/g)[0]
   const newPage = indexPage.replace(/(?:\r\n|\r|\n)+$/, '').concat(carry.repeat(2), `# [${author.name}](${author.slug}/)`)

   return writeFileFromBuffer(`${AUTHORS_DIR}/index.md`, Buffer.from(newPage))
}

let abort = true

download: while(true){

   const answer = (await rl.question(`\nDo you want to proceed now? (y/n): `)).trim()

   const i = ['y', 'yes', 'n', 'no'].findIndex(e => e === answer)
   
   if (i < 0) { continue download }
   if (i > 1) { break }

   createDirSync(`${tempDir}/${author.slug}/assets`)
   createDirSync(`${PUBLIC_DIR}/assets/avatar`)

   await Promise.all([...fetchScripts(), fetchAvatar(), createDummyPage(), addToAuthorsIndexPage()])
   await move(`${tempDir}/${author.slug}`, `${SCRIPTS_DIR}/${author.slug}`)

   abort = false
   author.lastUpdated = new Date().toISOString()
   metaFull[author.slug] = { ...author }
   break
}

if (abort) {
   warning(`\nOperation cancelled! No author entry was created.`)
} else {
   await writeMetaFiles(metaFull)
   green(`\nThe author has been added!`)
}

rl.close()