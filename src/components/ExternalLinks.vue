<script setup lang="ts">
const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.blur()
}
</script>

<template>
  <div class="flex items-center">
    <UTooltip :text="$t('nav.tooltip.discord')">
      <UButton variant="ghost" to="https://www.discord.gg/csgokz" target="_blank" @mouseleave="handleMouseLeave">
        <IconDiscord />
      </UButton>
    </UTooltip>

    <UTooltip :text="$t('nav.tooltip.github')">
      <UButton variant="ghost" to="https://github.com/KZGlobalTeam" target="_blank" @mouseleave="handleMouseLeave">
        <IconGithub />
      </UButton>
    </UTooltip>

    <UTooltip :text="$t('nav.tooltip.docs')">
      <UButton variant="ghost" to="https://docs.cs2kz.org" target="_blank" @mouseleave="handleMouseLeave">
        <IconBook />
      </UButton>
    </UTooltip>

    <UTooltip :text="$t('nav.tooltip.dashboard')">
      <UButton variant="ghost" to="https://dashboard.cs2kz.org" target="_blank" @mouseleave="handleMouseLeave">
        <IconDashboard />
      </UButton>
    </UTooltip>
  </div>
</template>
