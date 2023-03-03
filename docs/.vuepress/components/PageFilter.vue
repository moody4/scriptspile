<!-- 
   Component was written with the assumption that the only pages that would be filtered are those placed in the /scripts/ directory. 
   The filter keys are case-sensitive and correspond to the fronmatter properties of a page.
   Frontmatter properties: title, author, software, tags. 
-->

<script setup>
import { usePages } from '@temp/pages'

const props = defineProps({
   filterKey: String,
   filterValue: String
})

const pages = usePages()
const filteredPages = pages.filter(page => {
   return page.frontmatter.hasOwnProperty(props.filterKey) && 
          page.frontmatter[props.filterKey] === props.filterValue
}).sort((a, b) => a.title === b.title ? 0 : (a.title < b.title ? -1 : 1))
// TODO: Implement filtering by tags. Is multi-tag filtering needed?

</script>

<template>
   <p v-if="!filteredPages.length">There are no scripts yet</p>
   <Content v-else v-for="page in filteredPages" :page-key="page.key"/>
</template>