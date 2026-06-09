<script setup lang="ts">
  const props = defineProps<{
    countryOptions: { iso: string; name: string }[];
    selectedIso: string | null;
    hasSelection: boolean;
  }>();

  const emit = defineEmits<{
    selectCountry: [iso: string];
    randomCountry: [];
    shuffleAll: [];
    clearSelection: [];
  }>();

  const selectValue = computed(() => props.selectedIso ?? '');

  function handleSelectChange(value: unknown): void {
    if (typeof value === 'string' && value && value !== props.selectedIso) {
      emit('selectCountry', value);
    }
  }

  function handleRandom(): void {
    emit('randomCountry');
  }

  function handleShuffleAll(): void {
    emit('shuffleAll');
  }

  function handleClear(): void {
    emit('clearSelection');
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <Select
      :model-value="selectValue"
      name="country-select"
      @update:model-value="handleSelectChange"
    >
      <SelectTrigger size="sm" class="w-full font-medium">
        <SelectValue placeholder="Pick a country…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="opt in countryOptions"
          :key="opt.iso"
          :value="opt.iso"
        >
          {{ opt.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div class="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        class="flex-1 gap-1.5 rounded-md"
        @click="handleRandom"
      >
        <Icon name="lucide:dice-5" class="size-4" />
        Random
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="flex-1 gap-1.5 rounded-md"
        :disabled="!hasSelection"
        @click="handleShuffleAll"
      >
        <Icon name="lucide:refresh-cw" class="size-4" />
        Shuffle
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="gap-1.5 rounded-md"
        :disabled="!hasSelection"
        :aria-label="'Clear selection'"
        @click="handleClear"
      >
        <Icon name="lucide:x" class="size-4" />
      </Button>
    </div>
  </div>
</template>
