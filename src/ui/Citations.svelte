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
  export let citations: [Entry, string[]][];

  afterUpdate(() => {
    // Create icons via Obsidian API
    fishAll('.zoteroLinkIcon').forEach((el) => {
      setIcon(el, 'popup-open');
    });
  })

</script>

<style>
ul#citations-list {
  list-style: none;
  padding: 0 10px;
}

ul#citations-list li {
  margin: 10px 0;
}

.zoteroLinks {
  padding: 0 6px 0 25px;
}

.zoteroLinks button {
  display: inline-block;
  margin-right: 3px;
  padding: 6px;
}
</style>

<div id="citations-container" class="container">
  {#if loading}
    <div class="zoteroModalLoading">
      <div class="zoteroModalLoadingAnimation"></div>
      <p>Loading citation database. Please wait...</p>
    </div>
  {:else}
    {#each citations as [citation, lines]}
      <div class="tree-item">
        <div class="tree-item-self">
          <div class="collapse-icon"></div>
          <div class="tree-item-inner">
            <span class="zoteroTitle">{citation.title}</span>
            <span class="zoteroCitekey">{citation.id}</span>
            <span class="zoteroAuthors"
              class:zoteroAuthorsEmpty="{!citation.authorString}">
              {citation.authorString}
            </span>
          </div>
          <div class="tree-item-flair-outer">
            <span class="tree-item-flair">{lines.length}</span>
          </div>
        </div>
        <div class="search-result-file-matches">
          {#each lines as line}
            <div class="search-result-file-match">{line}</div>
          {/each}
        </div>
        <div class="zoteroLinks">
          <button class="zoteroLinkIcon"></button>
          {#if citation.pdfs?.length > 0}
            <button on:click={() => openPDF(citation)}>PDF</button>
          {/if}
          <button on:click={() => open(citation.zoteroSelectURI)}>Zot</button>
        </div>
      </div>
    {/each}
  {/if}
</div>
