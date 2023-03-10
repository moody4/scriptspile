import { defineUserConfig } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default'
import { usePagesPlugin } from 'vuepress-plugin-use-pages'
import { searchPlugin } from '@vuepress/plugin-search'
import { scriptspilePlugin }from './modules/scriptspilePlugin.js'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
// import { componentsPlugin } from "vuepress-plugin-components";

import { getDirname, path } from '@vuepress/utils'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
   base: '/scriptspile/',
   lang: 'en-US',
   title: '📜 ScriptsPile',
   description: 'Adobe software scripts archive',
   alias: {
      // '@assets': path.resolve(__dirname, './assets'),
   },
   public: 'docs/public',
   dest: 'public/',
   theme: defaultTheme({
      docsRepo: 'https://github.com/moody4/scriptspile',
      docsBranch: 'main',
      docsDir: 'docs',
      editLinkPattern: ':repo/edit/:branch/:path',
      repo: 'https://github.com/moody4/scriptspile',
      repoLabel: 'GitHub',
      colorMode: 'dark',
      colorModeSwitch: false,
      navbar: [
         {
            text: 'Home',
            link: '/'
         },
         {
            text: 'About',
            link: '/about'
         },
         {
            text: 'How to use',
            children: [
               // {text: 'Guide For ScriptsPile', link: '/howtouse'}, 
               {text: 'Adobe Illustrator Scripts', link: '/illustrator'},
               {text: 'Adobe Photoshop Scripts', link: '/photoshop'}
            ]
         },
         {
            text: 'Contribute',
            link: '/contribute',
         },
      ],
   }),
   extendsMarkdown: (md) => {
   },
   plugins: [
      usePagesPlugin({
         startsWith: '/scripts/'
      }),
      searchPlugin({
         hotKeys: ['s', '/']
      }),
      scriptspilePlugin(),

      mdEnhancePlugin({
         imgLazyload: true,
         // imgMark: true,
         imgSize: true,
      }),

      // componentsPlugin({
      //   components: [
      //     "YouTube",
      //   ],
      // }),

   ],

})
