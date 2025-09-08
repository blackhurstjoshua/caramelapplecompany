<script lang="ts">
  import { onMount } from 'svelte';
  import ImageUpload from '$lib/components/ImageUpload.svelte';
  import { listImages, deleteImage, getImageUrl, type ImageUploadResult } from '$lib/services/images';
  import { settingsService } from '$lib/stores/settings';
  import { Trash2, Copy, ExternalLink, Star } from '@lucide/svelte';

  interface ImageFile {
    name: string;
    path: string;
    url: string;
    size?: number;
    createdAt?: string;
    updatedAt?: string;
  }

  let images: ImageFile[] = $state([]);
  let loading = $state(true);
  let selectedFolder = $state('hero');
  let copySuccess = $state('');
  let currentHeroImage = $state<string | undefined>(undefined);

  const folders = [
    { value: '', label: 'Root' },
    { value: 'hero', label: 'Hero Images' },
    { value: 'products', label: 'Product Images' },
    { value: 'story', label: 'Story Images' },
    { value: 'misc', label: 'Miscellaneous' }
  ];

  onMount(async () => {
    await loadSettings();
    loadImages();
  });

  async function loadSettings() {
    const settings = await settingsService.load();
    currentHeroImage = settings.heroImageUrl;
  }

  async function loadImages() {
    loading = true;
    const result = await listImages(selectedFolder);
    if (result.success) {
      images = result.images;
    }
    loading = false;
  }

  function handleUploadComplete(result: ImageUploadResult) {
    if (result.success) {
      // Reload images to show the new upload
      loadImages();
    }
  }

  async function handleDelete(path: string) {
    if (confirm('Are you sure you want to delete this image?')) {
      const result = await deleteImage(path);
      if (result.success) {
        // Remove from local array
        images = images.filter(img => img.path !== path);
      } else {
        alert('Failed to delete image: ' + result.error);
      }
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      copySuccess = url;
      setTimeout(() => {
        copySuccess = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }

  async function setAsHeroImage(url: string) {
    try {
      await settingsService.updateHeroImage(url);
      currentHeroImage = url;
      alert('Hero image updated successfully!');
    } catch (error) {
      alert('Failed to update hero image');
      console.error(error);
    }
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Reactive: reload images when folder changes
  $effect(() => {
    if (selectedFolder !== undefined) {
      loadImages();
    }
  });
</script>

<svelte:head>
  <title>Image Management | Admin</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Image Management</h1>
    <p class="text-gray-600">Upload and manage images for your website</p>
  </div>

  <!-- Folder Selection -->
  <div class="mb-6">
    <label for="folder-select" class="block text-sm font-medium text-gray-700 mb-2">
      Select Folder
    </label>
    <select
      id="folder-select"
      bind:value={selectedFolder}
      class="select select-bordered w-full max-w-xs bg-white"
    >
      {#each folders as folder}
        <option value={folder.value}>{folder.label}</option>
      {/each}
    </select>
  </div>

  <!-- Upload Section -->
  <div class="mb-8 p-6 bg-gray-50 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Upload New Image</h2>
    <ImageUpload
      folder={selectedFolder}
      onUploadComplete={handleUploadComplete}
      label="Upload to {folders.find(f => f.value === selectedFolder)?.label || 'Root'}"
    />
  </div>

  <!-- Images Grid -->
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-4">
      Images in {folders.find(f => f.value === selectedFolder)?.label || 'Root'}
    </h2>

    {#if loading}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    {:else if images.length === 0}
      <div class="text-center py-12 bg-gray-50 rounded-lg">
        <p class="text-gray-500">No images found in this folder</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each images as image}
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <!-- Image Preview -->
            <div class="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={image.url}
                alt={image.name}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- Image Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 truncate mb-2" title={image.name}>
                {image.name}
              </h3>
              
              <div class="text-sm text-gray-500 space-y-1 mb-3">
                <p>Size: {formatFileSize(image.size)}</p>
                {#if image.createdAt}
                  <p>Created: {new Date(image.createdAt).toLocaleDateString()}</p>
                {/if}
              </div>

              <!-- Hero Image Indicator -->
              {#if currentHeroImage === image.url}
                <div class="mb-2 flex items-center text-yellow-600 text-sm">
                  <Star class="w-4 h-4 mr-1 fill-current" />
                  Current Hero Image
                </div>
              {/if}

              <!-- Actions -->
              <div class="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onclick={() => copyUrl(image.url)}
                  class="flex-1 btn btn-sm btn-outline"
                  class:btn-success={copySuccess === image.url}
                  title="Copy URL"
                >
                  <Copy class="w-4 h-4 mr-1" />
                  {copySuccess === image.url ? 'Copied!' : 'Copy URL'}
                </button>

                <!-- Set as Hero Button (only show for hero folder or if it's the current hero) -->
                {#if selectedFolder === 'hero' || currentHeroImage === image.url}
                  <button
                    type="button"
                    onclick={() => setAsHeroImage(image.url)}
                    class="btn btn-sm"
                    class:btn-primary={currentHeroImage !== image.url}
                    class:btn-success={currentHeroImage === image.url}
                    title={currentHeroImage === image.url ? 'Current hero image' : 'Set as hero image'}
                    disabled={currentHeroImage === image.url}
                  >
                    <Star class={`w-4 h-4 ${currentHeroImage === image.url ? 'fill-current' : ''}`} />
                  </button>
                {/if}

                <a
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-ghost"
                  title="Open in new tab"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onclick={() => handleDelete(image.path)}
                  class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                  title="Delete image"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
