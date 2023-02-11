import { defineClientConfig, usePagesData } from '@vuepress/client'
import TagLinks from './components/TagLinks.vue'
import TagList from './components/TagList.vue'
import ScriptPageHeader from './components/ScriptPageHeader.vue'
import PageFilter from './components/PageFilter.vue'
import RandomFeaturing from './components/RandomFeaturing.vue'

export default defineClientConfig({

   enhance({ app, router, siteData }) {

      app.component('TagLinks', TagLinks)
      app.component('TagList', TagList)
      app.component('ScriptPageHeader', ScriptPageHeader)
      app.component('PageFilter', PageFilter)
      app.component('RandomFeaturing', RandomFeaturing)

      // const pagesData = usePagesData()
      
      // Promise.all(Object.keys(pagesData.value).map(key => pagesData.value[key]()))
      // .then(pages => {
      // 	app.provide('all_pages', pages)
      // 	app.provide('scripts_pages', pages.filter(page => page.path.startsWith('/scripts/')))
      // })

   },
   setup() {
   },
   rootComponents: [],
})

