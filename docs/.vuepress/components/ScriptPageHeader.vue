<script setup>
import { usePages } from '@temp/pages'

const props = defineProps({
   pageKey: String // mandatory
})

const pages = usePages()
const targetPage = pages.find(page => page.key === props.pageKey)
const filename = targetPage.frontmatter.filename
const software = targetPage.frontmatter.software
const author = targetPage.frontmatter.author

</script>

<template>
<div id="header">
   <div class="row">
      <TagLinks :page="targetPage"/>
      <span>Download: <a :href="$withBase(`/${filename}`)" download>{{`${filename}`}}</a></span>
   </div>
   <div class="row">
      <span>Script for: <router-link :to="encodeURI(`/${software}`)">{{software}}</router-link></span>
      <span>Author: <router-link :to="encodeURI(`/Authors/${author.replace(/\s/g, '-')}`)">{{author}}</router-link></span>
   </div>
</div>
</template>

<style>
#header {
   display: flex;
   flex-flow: column;
}

.row {
   margin-bottom: 0.5em;
   display: flex;
   flex-flow: row;
   justify-content: space-between;
}
</style>