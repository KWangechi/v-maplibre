<script setup lang="ts">
  useSeoMeta({
    title: 'mapcn-vue - Beautiful maps for Vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogTitle: 'mapcn-vue - Beautiful maps for Vue',
    ogDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogType: 'website',
    ogSiteName: 'mapcn-vue',
    twitterCard: 'summary_large_image',
    twitterTitle: 'mapcn-vue - Beautiful maps for Vue',
    twitterDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Beautiful maps, made simple.',
    description:
      'Map components for Vue. Built on MapLibre, styled with Tailwind CSS.',
  });

  const { copy, copied } = useClipboard({
    source: 'npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map',
  });
</script>

<template>
  <div class="hide-scrollbar min-h-dvh overflow-y-auto">
    <!-- Hero -->
    <section class="relative px-6 pt-24 pb-12 md:pt-32 lg:pt-40">
      <div class="mx-auto max-w-4xl text-center">
        <h1
          class="gradient-text font-display text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Beautiful maps, made simple.
        </h1>
        <p
          class="mx-auto mt-5 max-w-xl text-base/relaxed text-muted-foreground md:text-lg"
        >
          Map components for Vue. Built on
          <a
            href="https://github.com/geoql/v-maplibre"
            class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >MapLibre</a
          >. Styled with Tailwind. Zero config. One command setup.
        </p>

        <!-- CLI command -->
        <div class="mt-8 flex justify-center">
          <button
            class="inline-flex max-w-full items-center gap-3 rounded-full border border-border/50 bg-muted/50 px-5 py-2.5 font-mono text-xs backdrop-blur-sm transition-colors hover:bg-muted sm:text-sm"
            @click="copy()"
          >
            <span class="text-muted-foreground/60">$</span>
            <code class="truncate text-foreground/90"
              >npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map</code
            >
            <Icon
              :name="copied ? 'lucide:check' : 'lucide:copy'"
              class="size-4 shrink-0"
              :class="copied ? 'text-emerald-500' : 'text-muted-foreground'"
            />
          </button>
        </div>

        <!-- CTA buttons -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/docs/introduction"
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            Get Started
            <Icon name="lucide:arrow-right" class="size-4" />
          </NuxtLink>
          <NuxtLink
            to="/examples"
            class="inline-flex h-10 items-center gap-2 rounded-lg border border-border/50 px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View Examples
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Demo cards -->
    <section class="px-6 pb-12">
      <div class="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          class="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted/30 sm:col-span-2"
        >
          <ClientOnly>
            <LazyActiveUsersDemo />
            <template #fallback>
              <div
                class="flex size-full items-center justify-center text-muted-foreground"
              >
                <Icon name="lucide:loader-2" class="size-6 animate-spin" />
              </div>
            </template>
          </ClientOnly>
          <div
            class="absolute top-3 left-3 z-10 rounded-lg border border-border/50 bg-background/90 p-3 shadow-sm backdrop-blur-sm"
          >
            <div
              class="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase"
            >
              Active Users
            </div>
            <div class="text-2xl/tight font-semibold">2,847</div>
            <div class="mt-1 flex items-center gap-1">
              <Icon name="lucide:trending-up" class="size-3 text-emerald-500" />
              <span class="text-xs text-emerald-500">+12.5%</span>
            </div>
          </div>
        </div>

        <div
          class="relative aspect-4/3 overflow-hidden rounded-xl border border-border/50 bg-muted/30"
        >
          <div
            class="absolute top-2 left-2 z-10 rounded-sm bg-background/90 px-2 py-1 text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-sm"
          >
            Global Delivery
          </div>
          <ClientOnly>
            <LazyDeliveryDemo />
            <template #fallback>
              <div
                class="flex size-full items-center justify-center text-muted-foreground"
              >
                <Icon name="lucide:loader-2" class="size-6 animate-spin" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div
          class="relative aspect-4/3 overflow-hidden rounded-xl border border-border/50 bg-muted/30"
        >
          <div
            class="absolute top-2 left-2 z-10 rounded-sm bg-background/90 px-2 py-1 text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-sm"
          >
            Trips
          </div>
          <ClientOnly>
            <LazyTripsDemo />
            <template #fallback>
              <div
                class="flex size-full items-center justify-center text-muted-foreground"
              >
                <Icon name="lucide:loader-2" class="size-6 animate-spin" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="border-t border-border/40 px-6 py-16 md:py-20">
      <div class="mx-auto max-w-5xl">
        <div class="mb-12 text-center">
          <h2
            class="gradient-text font-display text-2xl font-bold tracking-tighter md:text-3xl"
          >
            Everything you need for maps
          </h2>
          <p class="mt-3 text-sm text-muted-foreground md:text-base">
            From basic markers to deck.gl visualizations — all components to
            build stunning map applications.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HomeFeatureCard
            icon="lucide:map-pin"
            title="Core Components"
            description="Map, Markers, Popups, and Navigation Controls. Everything to get started."
          />
          <HomeFeatureCard
            icon="lucide:layers"
            title="MapLibre Layers"
            description="GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, and Canvas layers."
          />
          <HomeFeatureCard
            icon="lucide:sparkles"
            title="deck.gl Layers"
            description="High-performance WebGL layers: Scatterplot, Arc, Heatmap, Hexagon, Trips, and more."
          />
          <HomeFeatureCard
            icon="lucide:palette"
            title="Theme Aware"
            description="Dark mode support out of the box with automatic basemap switching."
          />
          <HomeFeatureCard
            icon="lucide:copy"
            title="Copy & Paste"
            description="Add components to your project with a single CLI command. No complex setup."
          />
          <HomeFeatureCard
            icon="lucide:code-2"
            title="TypeScript First"
            description="Full TypeScript support with excellent IDE autocompletion and type safety."
          />
        </div>
      </div>
    </section>

    <!-- Get Started -->
    <section class="px-6 py-16 md:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <h2
          class="gradient-text font-display text-2xl font-bold tracking-tighter md:text-3xl"
        >
          Get started in seconds
        </h2>
        <p class="mt-3 text-sm text-muted-foreground md:text-base">
          Add map components to your project with the shadcn-vue CLI.
        </p>
        <div class="mt-6">
          <div
            class="overflow-hidden rounded-xl border border-border/50 bg-muted/30 text-left"
          >
            <div
              class="flex items-center gap-2 border-b border-border/50 px-4 py-2"
            >
              <div
                class="size-2.5 rounded-full bg-red-500/70"
                aria-hidden="true"
              ></div>
              <div
                class="size-2.5 rounded-full bg-yellow-500/70"
                aria-hidden="true"
              ></div>
              <div
                class="size-2.5 rounded-full bg-green-500/70"
                aria-hidden="true"
              ></div>
              <span class="ml-2 text-xs text-muted-foreground">Terminal</span>
            </div>
            <div class="overflow-x-auto p-4">
              <code class="text-sm whitespace-nowrap text-foreground"
                >npx shadcn-vue@latest add
                https://mapcn-vue.geoql.in/r/map</code
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
