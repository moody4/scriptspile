import { fs as _fs, path as _path } from '@vuepress/utils'

export const testPlugin = (/* options */) => (app) => {
   
   const name = 'testPlugin'
   
   const _authorsPages = {}
   const _softwarePages = {}
   const _scriptsPages = []
   const _tags = []

   const pathStartsWith = (path, URISegment) => path?.startsWith(app.dir.source(URISegment))

   const getFilesByExt = (base, exts, files, result) => {
      files = files || _fs.readdirSync(base) 
      result = result || [] 

      files.forEach((file) => {
            var newBase = _path.join(base,file)
            if (_fs.statSync(newBase).isDirectory()) {
               result = getFilesByExt(newBase, exts, _fs.readdirSync(newBase), result)
            } 
            else {
               const ext = exts.find(ext => file.slice(-(ext.length+1)) === `.${ext}`)
               if (ext) result.push(newBase)
            }
         }
      )
      return result
   }
   
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
         _authorsPages[page.title] = page
      } 
      
      else if(pathStartsWith(filePath, 'software/')){
         page.frontmatter.sidebar = parsePageHeaders(page).map(convertHeaderToSidebarItem)
         _softwarePages[page.title.replace(/^Adobe\s/, "").toLowerCase()] = page
      } 
      
      else if (pathStartsWith(filePath, 'scripts/')) {

         page.frontmatter.sidebar = false
         // Embedding <ScriptPageHeader> component in a script page
         page.sfcBlocks.template.contentStripped = page.sfcBlocks.template.contentStripped.replace(/^<h2.+<\/h2>\n/, (m) => `${m}<ScriptPageHeader pageKey="${page.key}" />`)
         
         _scriptsPages.push(page)
         _tags.push(...page.frontmatter.tags);

         const addToPageSidebar = async (page, scriptPage) => {
            await new Promise((resolve, reject) => {
               let waitedFor = 0
               let delay = 100
               setTimeout(function tick () {
                  if (page === undefined) {
                     waitedFor += delay
                     if (waitedFor >= 1000) reject(new Error(`Failed to add item to a page sidebar, page probably doesn't exist.\n Problem with frontmatter of the script page: ${scriptPage.path}`))
                     setTimeout(tick, delay) 
                  }
                  else {
                     const child = {text: scriptPage.title, link: `#${scriptPage.title.toLowerCase()}`, children: []}
                     page.frontmatter.sidebar[1].children.push(child)
                     page.frontmatter.sidebar[1].children.sort((a, b) => a.text === b.text ? 0 : (a.text < b.text ? -1 : 1))
                     resolve()
                  }
               }, delay)
            })
            .catch((error) => { throw error } )
         }

         const author = page.frontmatter.author
         const software = page.frontmatter.software

         await addToPageSidebar(_authorsPages[author], page)
         await addToPageSidebar(_softwarePages[software], page)
         
      }

      else if (pathStartsWith(filePath, 'tags/')) {

         const fillTagsPageSidebar = async () => {
            await new Promise((resolve, reject) => {
               // Is there a way to know exactly whether all tags have been collected, other than setting an arbitrary counter?
               setTimeout(() => resolve(_tags), 1100)
            })
            .then((result) => {
               const tags = [...(new Set(result))].sort()
               const children = tags.map(tag => { return {text: tag, link: `#${tag.toLowerCase()}`} })
               page.frontmatter.sidebar = [{text: 'Tags', children: children}]

               // Clear arrays in dev server scope for HMR
               _scriptsPages.length = 0;
               _tags.length = 0;
            })
         }

         await fillTagsPageSidebar()
         
      }

   }

   const onPrepared = (app) => {

      // Copy .jsx and .js scripts from docs/scripts/ to docs/public dir
      const jsx_files_paths = getFilesByExt(`${app.dir.source()}/scripts/`, ['jsx', 'js'])

      jsx_files_paths.forEach((path) => {
         _fs.copyFile(path, `${app.dir.public()}/${_path.basename(path)}`, (err) => { if (err) throw err })
      })

   }

   const onGenerated = (app) => {

      // Delete .jsx and .js scripts from docs/public dir on 'npm run build'
      const jsx_files_paths = getFilesByExt(`${app.dir.public()}/`, ['jsx', 'js'])

      jsx_files_paths.forEach((path) => {
         _fs.unlink(path, (err) => { if (err) throw err })
      })
      
   }

   return { name, extendsPageOptions, extendsPage, onPrepared, onGenerated }

}
