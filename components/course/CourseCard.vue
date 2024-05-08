<script setup lang="ts">
import type { CourseExt } from "~/types/map"
defineProps<{
  course: CourseExt
}>()
</script>

<template>
  <div
    class="card w-max flex items-center rounded-md ring ring-blue-600/50 hover:scale-[103%] transition ease-in cursor-pointer"
  >
    <img :src="course.img" loading="lazy" class="w-64 h-auto rounded-l-md" />

    <div :style="{ backgroundImage: `url(${course.img})` }" class="info">
      <p class="text-gray-100 font-medium text-lg">{{ course.name }}</p>
      <div class="flex items-center gap-1">
        <IconMap :width="1.2" />
        <p class="text-gray-300">{{ course.map }}</p>
      </div>

      <div class="text-sm">
        <span class="text-gray-400 mr-1">made by</span>
        <span
          v-for="mapper in course.mappers"
          :key="mapper.steam_id"
          class="text-cyan-600"
        >
          {{ mapper.name }}
        </span>
      </div>

      <div class="flex items-center gap-2 mt-10">
        <div
          :class="
            course.ranked_status === 'ranked'
              ? 'text-green-400 bg-green-300/20'
              : 'text-gray-300'
          "
          class="px-1 text-xs border rounded-sm"
        >
          {{ course.ranked_status.toUpperCase() }}
        </div>

        <p :style="{ color: getTierColor(course.tier) }" class="font-semibold">
          {{
            course.tier
              .split("_")
              .map((tier) => tier.at(0)?.toUpperCase() + tier.slice(1))
              .join(" ")
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info {
  width: 300px;
  height: 144px;
  padding: 0.1rem 0.5rem;
  display: flex;
  flex-direction: column;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  position: relative;
  background-size: 200% 200%;
  background-position: center;
}

.info::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  background: linear-gradient(
    to right,
    rgba(46, 46, 46),
    rgba(46, 46, 46, 0.6)
  );
  z-index: 0;
  transition: background ease-in;
}

.card:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  background: rgba(83, 83, 83, 0.4);
  z-index: 2;
  transition: background ease-in;
}

.info > * {
  position: relative;
  z-index: 3;
}
</style>