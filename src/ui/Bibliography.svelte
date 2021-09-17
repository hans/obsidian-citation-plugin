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

  // afterUpdate(() => {
  //   // Create icons via Obsidian API
  //   fishAll('.zoteroLinkIcon').forEach((el) => {
  //     setIcon(el, 'popup-open');
  //   });
  //
  //   const sortOrderButton = fish('#zoteroButtonSortOrder');
  //   if (sortOrderButton) {
  //     setIcon(sortOrderButton, 'up-and-down-arrows', 20);
  //   }
  // })

</script>

<style>
.container {
  padding: 0 8px;
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

<div class="markdown-preview-bibliography">
  <h2>Bibliography</h2>

  <ul>
  {#if loading}
    Reloading citation library...
  {:else}
    <ul>
      {#each citations as [entry, citation, lines]}
        <li>{@html citation}</li>
      {/each}
    </ul>
  {/if}
</div>
