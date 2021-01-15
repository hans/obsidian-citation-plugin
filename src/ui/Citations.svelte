<script lang="ts">

  import type { Entry } from '../types';

  export let openPDF = (entry: Entry) => {
    if (entry.pdfs?.length > 0) {
      open(`file://${entry.pdfs[0]}`);
    }
  }

  // template variables
  export let loading: boolean = true;
  export let citations: [Entry, number][];

</script>

<style>
ul#citations-list {
  list-style: none;
  padding: 0 10px;
}

ul#citations-list li {
  margin: 10px 0;
}

ul.zoteroLinks {
  list-style: none;
}
ul.zoteroLinks li {
  display: inline-block;
  margin-right: 5px;
}
</style>

<div id="citations-container" class="container">
  {#if loading}
    <div class="zoteroModalLoading">
      <div class="zoteroModalLoadingAnimation"></div>
      <p>Loading citation database. Please wait...</p>
    </div>
  {:else}
    {#each citations as [citation, count]}
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
            <span class="tree-item-flair">{count}</span>
          </div>
        </div>
        <ul class="zoteroLinks">
          {#if citation.pdfs?.length > 0}
            <li><button on:click={() => openPDF(citation)}>PDF</button></li>
          {/if}
          <li><button on:click={() => open(citation.zoteroSelectURI)}>Zot</button></li>
        </ul>
      </div>
    {/each}
  {/if}
</div>
