<script setup>
import { computed } from 'vue'
import { withBase } from '@vuepress/client';
import { usePages } from '@temp/pages'

const props = defineProps({
   pageKey: String // mandatory
})

const pages = usePages()
const targetPage = computed(() => { return pages.find(page => page.key === props.pageKey) })

</script>

<template>
<div id="header">
   <div class="row">
      <TagLinks :page="targetPage"/>
      <span>Download: <a :href="$withBase(`/${targetPage.title}.jsx`)" download>{{targetPage.title}}.jsx</a></span>
   </div>
   <div class="row">
      <span>Script for: <router-link :to="encodeURI(`/${targetPage.frontmatter.software}`)">{{targetPage.frontmatter.software}}</router-link></span>
      <span>Author: <router-link :to="encodeURI(`/Authors/${targetPage.frontmatter.author.replace(/\s/g, '-')}`)">{{targetPage.frontmatter.author}}</router-link></span>
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