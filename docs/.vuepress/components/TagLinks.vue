<script setup>
import { usePageData } from '@vuepress/client'
import { usePages } from '@temp/pages'

const props = defineProps({
   pageKey: String,
   page: Object
})

let targetPage = undefined

if (props.page) { 
   targetPage = props.page
} else {
   const pages = usePages()
   const currentPage = usePageData()
   targetPage = props.pageKey ? pages.find(page => page.key === props.pageKey) : currentPage.value
}

</script>

<template>
   <div>
      Tags:
      <template v-for="tag in targetPage.frontmatter.tags" :key="tag">
         <router-link :to="`/tags#${tag}`">
            <span style="margin-right: 0.4em;">{{tag}}</span> 
         </router-link>
      </template>
   </div>
</template>
   