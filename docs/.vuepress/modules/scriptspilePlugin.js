import { fs as _fs, path as _path } from '@vuepress/utils'
import { escapeStr, getFiles, trimExt, readJSON, resolvePath } from 'scriptspile-helpers'
import { META_DIR, META_FILENAME, PUBLIC_DIR, SCRIPTS_DIR } from 'scriptspile-helpers/libs/globals.js'

const meta = await readJSON(`${META_DIR}/${META_FILENAME}`)

export const scriptspilePlugin = (/* options */) => (app) => {
   
   const name = 'scriptspilePlugin'
   
   const _authorsPages = {}
   const _softwarePages = {}
   const _scriptsPages = []
   const _tags = []

   const authorsInBase = Object.entries(meta).length

   const objRedinessWaiter = async (object, options = {}) => {

      const { 
         maxInterval = 500,
         delay = 100,
         errorMsg = `Waiting period has exceeded the allowable limit`,
         targetObjLength = 0 
      } = options

      const agnostic = targetObjLength === 0
      let waited = 0
      let lastLength = 0

      return new Promise ((resolve, reject) => {
         setTimeout(function tick () {
            const length = Object.entries(object).length
            waited += (lastLength === length)? delay : -waited
            if (waited >= maxInterval) {
               if (agnostic || length === targetObjLength) resolve(true)
               reject(new Error(errorMsg))
            } else {
               lastLength = length
               setTimeout(tick, delay);
            }
         })
      }).catch((error) => { throw error })
   }

   const scriptsPagesWaiter = objRedinessWaiter(_scriptsPages)
   const softwarePagesWaiter = objRedinessWaiter(_softwarePages)
   const authorsPagesWaiter = objRedinessWaiter(_authorsPages,
   { 
      // targetObjLength: authorsInBase, 
      errorMsg: `Failed to prepare authors data before compiling. It's either lack of author info in json file or missing author page.`
   })

   const pathStartsWith = (path, URISegment) => path?.startsWith(app.dir.source(URISegment))

   const extendsPageOptions = (pageOptions, app) => {
      
      const filePath = pageOptions.filePath ?? undefined
      const base = filePath ? _path.basename(pageOptions.filePath, '.md') : ''
      pageOptions.frontmatter = pageOptions.frontmatter ?? {}

      if (pathStartsWith(filePath, 'scripts/')) {
         pageOptions.frontmatter.permalink = `/scripts/${base}`
      }

      else if (pathStartsWith(filePath, 'software/')) {
         pageOptions.frontmatter.permalink = `/${base}`
      }

   }

   const extendsPage = async (page, app) => {

      const filePath = page.filePath ?? undefined

      const parsePageHeaders = (page) => {
         const matches = [...page.contentRendered.matchAll(/<h1.*?\a>\s(.*?)<\/h1>|<h2.*?\a>\s(.*?)<\/h2>/gm)]

         return matches.map(m => {
            const i = m[0].match(/<h(\d)/)[1] //<h> tag index
            const matchStripped = m[i].replace(/^<RouterLink.*?>(.*?)<\/RouterLink>/g, (m, $1) => $1)
            const lowerCase = matchStripped.toLowerCase()
            return { level: i, title: matchStripped, link: `#${lowerCase.replace(/\s/g, "-")}`, slug: lowerCase, children: [] }
         })
         .reduce((result, item) => {
            const i = result.length-1;
            if (!result.length || item.level === result[i].level) result.push(item)
            else if (item.level > result[i].level) result[i].children.push(item)
            return result
         }, [])
      }

      const convertHeaderToSidebarItem = header => { 
         return { text: header.title, link: header.link, children: header.children.map(convertHeaderToSidebarItem) }
      }

      if(pathStartsWith(filePath, 'authors/') && !filePath.endsWith('index.md')){
         page.frontmatter.sidebar = parsePageHeaders(page).map(convertHeaderToSidebarItem)
         const slug = escapeStr(page.title)
         _authorsPages[slug] = page
      } 
      
      else if(pathStartsWith(filePath, 'software/')){
         page.frontmatter.sidebar = parsePageHeaders(page).map(convertHeaderToSidebarItem)
         _softwarePages[page.title.replace(/^Adobe\s/, "").toLowerCase()] = page
      } 
      
      else if (pathStartsWith(filePath, 'scripts/')) {

         const addToPageSidebar = (page, scriptPage) => {
            const child = {text: scriptPage.title, link: `#${scriptPage.title.toLowerCase()}`, children: []}
            page.frontmatter.sidebar[1].children.push(child)
            page.frontmatter.sidebar[1].children.sort((a, b) => a.text === b.text ? 0 : (a.text < b.text ? -1 : 1))
         }
         
         _scriptsPages.push(page)
         _tags.push(...page.frontmatter.tags)
         
         page.frontmatter.sidebar = false
         page.sfcBlocks.template.contentStripped = page.sfcBlocks.template.contentStripped.replace(/^<h2.+<\/h2>\n/, (m) => `${m}<ScriptPageHeader pageKey="${page.key}" />`)
         
         const slug = escapeStr(page.frontmatter.author)
         const software = page.frontmatter.software
         
         await authorsPagesWaiter
         addToPageSidebar(_authorsPages[slug], page)

         await softwarePagesWaiter
         addToPageSidebar(_softwarePages[software], page)
         
      }

      else if (pathStartsWith(filePath, 'tags/')) {

         const fillTagsPageSidebar = () => {
            const tags = [...(new Set(_tags))].sort()
            const children = tags.map(tag => { return {text: tag, link: `#${tag.toLowerCase()}`} })
            page.frontmatter.sidebar = [{text: 'Tags', children: children}]
         }
         
         await scriptsPagesWaiter
         fillTagsPageSidebar()

         // Clear arrays in dev server scope for HMR
         _tags.length = 0
         _scriptsPages.length = 0
         
      }

   }

   const onPrepared = async (app) => {

      // Get scripts and copy them in docs/public dir so there was no empty "download" link in dev mode

      const files_paths = await getFiles(`${SCRIPTS_DIR}`, { filesExt: ['jsx', 'js', 'md'] })
      
      // Filter out scripts that don't have corresponding .md page
      const jsx_files_paths = files_paths.flatMap((path, i, arr) => {
         return (i+1 > arr.length-1 || trimExt(path) !== trimExt(arr[i+1])) ? [] : path
      })

      jsx_files_paths.forEach((path) => {
         _fs.copyFile(path, `${resolvePath(PUBLIC_DIR)}/${_path.basename(path)}`, (err) => { if (err) throw err })
      })
      
   }

   const onGenerated = async (app) => {

      // Delete .jsx and .js scripts from docs/public dir on 'npm run build'

      const jsx_files_paths = await getFiles(`${PUBLIC_DIR}`, { filesExt: ['jsx', 'js'] })

      jsx_files_paths.forEach((path) => {
         _fs.unlink(path, (err) => { if (err) throw err })
      })
      
   }

   return { name, extendsPageOptions, extendsPage, onPrepared, onGenerated }

}
