<script setup>
import { computed } from 'vue'
import { withBase } from '@vuepress/client';
import { usePages } from '@temp/pages'
import authorsMeta from '../modules/authorsMeta.json'

const pages = usePages() 
const r = Math.floor(Math.random() * pages.length)
const randomPage = pages[r]
const author = randomPage.frontmatter.author
const hasGithub = authorsMeta[author]?.github_user ? true : false
const nickname = hasGithub ? authorsMeta[author].github_user : author
const ghURL = hasGithub ? `https://github.com/${nickname}` : 'javascript:void(0)'
const avatar = computed(() => withBase(`/assets/avatar/${nickname}.jpg`))
let showAvatar = true

// let avatar = undefined
// if (hasGithub){
//    let response = await fetch(`https://api.github.com/users/${nickname}`);

//    if (response.ok){
//       let user = await response.json();
//       avatar = user.avatar_url
//    } else {
//       showAvatar = false
//       console.log(new Error(`Failed to fetch github user data, status: ${response.status}\nURL: ${response.url}`));
//    }
// }   

</script>

<template>
   <div id="container">
      <Content id="script_card" :page-key="randomPage.key" />
      <div id="author_card">
         <img id="avatar" :src="avatar" v-if="showAvatar">
         <div id="meta">
            <div id="name">
               <span style="color: #adbac7;">{{ author }}</span>
               <span style="color: #757f95;">{{ `@${nickname}` }}</span>
            </div>
            <div id="links">
               <div :class="{'social-link': true, disabled: !hasGithub }" >
                  <a :href="ghURL" target="_blank" rel="noopener noreferrer" aria-label="GitHub" disabled>
                     <svg aria-hidden="true" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                     </svg>
                  </a>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style>

#container {
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-content: flex-start;
}

#script_card {
   flex-shrink: 3;
}

#author_card {
   margin-top: 1.8em;
   display: flex;
   align-items: center;
   background-color: #282c34;
   border-radius: 0.5em;
   height: min-content;
   flex-shrink: 1;
}

#avatar {
   background-color: rgb(76, 76, 76);
   min-width: 150px;
   aspect-ratio : 1 / 1;
   flex-shrink: 1.5;
}

#meta {
   width: 100%;
   min-width: 200px;
   margin: 1.8em;
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-around;
}

#name {
   display: flex;
   flex-flow: column;
}

.social-link {
   display: flex;
   border-radius: 0.2em; 
   justify-content: center;
   align-items: center;
}

.social-link svg {
   fill: #757f95;
   width: 2em; 
}

.disabled { 
   pointer-events: none;
}

.disabled svg { 
   fill: hsl(220, 13%, 22%) !important;
}

@media only screen and (max-width: 588px) {
   #name {
      font-size: large !important;
   }
}

@media only screen and (max-width: 768px) {
   #container {
      flex-wrap: wrap-reverse;
   }

   #script_card {
      flex-basis: 100%;
   }
   #author_card {
      flex-direction: row;
      flex-basis: 100%;
   }
   #avatar {
      border-radius: 0.5em 0em 0em 0.5em;
   }
   #meta {
      margin: 1.8em;
   }

   #name {
      font-size: x-large;
      margin-right: 1.8em;
      overflow: hidden;
   }
}

@media only screen and (min-width: 768px) {
   #container {
      flex-wrap: nowrap;
   }

   #script_card {
      flex-basis: 100%;
   }
   #author_card {
      flex-direction: column;
      margin-left: 1.6em;
      flex-basis: 35%;
   }

   #avatar {
      min-width: 150px;
      border-radius: 0.5em 0.5em 0em 0em;
   }

   #name {
      font-size: large;
   }
}

</style>