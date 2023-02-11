<script setup>
import { usePages } from '@temp/pages'

const pages = usePages()

let tags = []

for (let i in pages) tags.push(...pages[i].frontmatter.tags)

tags = [...(new Set(tags))].sort()

</script>

<template>
   <div>
      <span v-for="tag in tags">
         <h2 :id="tag">
            <router-link :to="`/tags#${tag}`" class="header-anchor" aria-hidden="true">#</router-link>
            {{tag}}
         </h2>
         <ul>
            <template v-for="page in pages" >
               <li v-if="page.frontmatter.tags.some(elm => elm === tag)">
                  <router-link :to="page.path">
                     {{page.title}}
                  </router-link>
               </li>
            </template>
         </ul>
      </span>
   </div>
</template>