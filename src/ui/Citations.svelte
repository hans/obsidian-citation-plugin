<script lang="ts">

  import { setIcon } from 'obsidian';
  import { afterUpdate } from 'svelte';

  import type { Entry } from '../types';

  export let openPDF = (entry: Entry) => {
    if (entry.pdfs?.length > 0) {
      open(`file://${entry.pdfs[0]}`);
    }
  }

  // template variables
  export let loading: boolean = true;
  export let citations: [Entry, string, string[]][];

  afterUpdate(() => {
    // Create icons via Obsidian API
    fishAll('.zoteroLinkIcon').forEach((el) => {
      setIcon(el, 'popup-open');
    });

    const sortOrderButton = fish('#zoteroButtonSortOrder');
    if (sortOrderButton) {
      setIcon(sortOrderButton, 'up-and-down-arrows', 20);
    }
  })

</script>

<style>
.container {
  padding: 0 8px;
}

.nav-header{
  display: contents;
}

h3.title {
  color: var(--color-text-title);
  font-size: 1.5em;
  font-weight: 500;
  margin: 0;
  padding: 0 8px;
}

ul#citations-list {
  list-style: none;
  padding: 0 10px;
}

ul#citations-list li {
  margin: 10px 0;
}

.tree-item-self{
  width: 100%;
  display: flex;
  white-space: wrap;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  align-items: flex-start;
  padding: 2px 6px 2px 20px;
}

.tree-item-inner.citation-item-inner{
  font-size: 16px;
  white-space: initial;
  line-height: 1.4em;
}

.search-result-file-match {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-file-matches {
  border-bottom: none;
  margin-bottom: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zoteroLinks {
  display: flex;
  padding: 0 6px 15px 25px;
  border-bottom: 1px solid var(--background-modifier-border);
  margin-bottom: 15px;
}

.zoteroLinks button {
  display: inline-flex;
  margin-right: 3px;
  padding: 4px 14px;
  border-radius: 6px;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: var(--text-accent);
  border: 1px solid var(--background-modifier-border);
}

/*
 * Loading animation from
 * https://loading.io/css/
 */
 .zoteroPaneLoading {
   color: var(--text-muted);
   text-align: center;
 }
.zoteroPaneLoadingAnimation {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.zoteroPaneLoadingAnimation {
  content: " ";
  display: block;
  width: 32px;
  height: 32px;
  margin: 10px auto;
  border-radius: 50%;
  border: 3px solid #ccc;
  border-color: #ccc transparent #eee transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>

<div id="citations-container" class="container">
  <div class="nav-header">
    <h3 class="title">Citations</h3>
    <div class="nav-buttons-container">
      <div class="nav-action-button" id="zoteroButtonSortOrder" aria-label="Change sort order"></div>
    </div>
  </div>

  {#if loading}
    <div class="zoteroPaneLoading">
      <div class="zoteroPaneLoadingAnimation"></div>
      <p>Loading citation database. Please wait...</p>
    </div>
  {:else}
    {#each citations as [entry, citation, lines]}
      <div class="tree-item">
        <div class="tree-item-self">
          <div class="collapse-icon"></div>
          <div class="tree-item-inner citation-item-inner">
            {@html citation}
          </div>
          <div class="tree-item-flair-outer">
            <span class="tree-item-flair">{lines.length}</span>
          </div>
        </div>
        <div class="search-result-file-matches">
          {#each lines as line}
            <div class="search-result-file-match">{line.replaceAll(/^\s+|\s+$/mg, '')}</div>
          {/each}
        </div>
        <div class="zoteroLinks">
          <button class="zoteroLinkIcon"></button>
          {#if entry.pdfs?.length > 0}
            <button on:click={() => openPDF(entry)}>PDF</button>
          {/if}
          <button on:click={() => open(entry.zoteroSelectURI)}>Zot</button>
        </div>
      </div>
    {/each}
  {/if}
</div>
