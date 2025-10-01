<script lang="ts">
  import { uploadImage, type ImageUploadResult } from '$lib/services/images';
  import { Upload, X, Check } from '@lucide/svelte';

  interface Props {
    folder?: string;
    onUploadComplete?: (result: ImageUploadResult) => void;
    acceptedTypes?: string;
    maxSizeMB?: number;
    label?: string;
    showPreview?: boolean;
  }

  let {
    folder = '',
    onUploadComplete,
    acceptedTypes = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
    maxSizeMB = 5,
    label = 'Upload Image',
    showPreview = true
  }: Props = $props();

  let fileInput: HTMLInputElement;
  let uploading = $state(false);
  let uploadResult: ImageUploadResult | null = $state(null);
  let previewUrl: string | null = $state(null);
  let dragOver = $state(false);

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    const file = event.dataTransfer?.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  async function handleFile(file: File) {
    // Reset previous results
    uploadResult = null;
    
    // Create preview
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }


    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      uploadResult = {
        success: false,
        error: `File must be smaller than ${maxSizeMB}MB`
      };
      return;
    }

    // Upload file
    uploading = true;
    try {
      const result = await uploadImage(file, folder);
      uploadResult = result;
      
      if (result.success && onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      uploadResult = {
        success: false,
        error: 'Upload failed'
      };
    } finally {
      uploading = false;
    }
  }

  function clearUpload() {
    uploadResult = null;
    previewUrl = null;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }
</script>

<div class="w-full max-w-md mx-auto">
  <!-- File Input (Hidden) -->
  <input
    bind:this={fileInput}
    type="file"
    accept={acceptedTypes}
    on:change={handleFileSelect}
    class="hidden"
  />

  <!-- Upload Area -->
  <div
    class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
    class:border-blue-400={dragOver}
    class:bg-blue-50={dragOver}
    class:border-gray-300={!dragOver}
    class:bg-gray-50={!dragOver && !uploading}
    class:bg-blue-100={uploading}
    on:click={triggerFileInput}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    role="button"
    tabindex="0"
  >
    {#if uploading}
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p class="text-sm text-gray-600">Uploading...</p>
      </div>
    {:else if uploadResult?.success}
      <div class="flex flex-col items-center">
        <Check class="w-8 h-8 text-green-500 mb-2" />
        <p class="text-sm text-green-600 font-medium">Upload successful!</p>
        <button
          type="button"
          on:click|stopPropagation={clearUpload}
          class="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Upload another
        </button>
      </div>
    {:else}
      <div class="flex flex-col items-center">
        <Upload class="w-8 h-8 text-gray-400 mb-2" />
        <p class="text-sm text-gray-600 mb-1">{label}</p>
        <p class="text-xs text-gray-500">
          Drag & drop or click to select
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Max size: {maxSizeMB}MB
        </p>
      </div>
    {/if}
  </div>

  <!-- Preview -->
  {#if showPreview && previewUrl}
    <div class="mt-4 relative">
      <img
        src={previewUrl}
        alt="Preview"
        class="w-full h-40 object-cover rounded-lg border"
      />
      <button
        type="button"
        on:click={clearUpload}
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        aria-label="Remove image"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/if}

  <!-- Error Message -->
  {#if uploadResult?.error}
    <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
      {uploadResult.error}
    </div>
  {/if}

  <!-- Success Message with URL -->
  {#if uploadResult?.success && uploadResult.url}
    <div class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
      <p class="text-sm text-green-600 font-medium mb-1">Image uploaded successfully!</p>
      <p class="text-xs text-gray-600 break-all">
        URL: {uploadResult.url}
      </p>
    </div>
  {/if}
</div>
