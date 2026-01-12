<template>
  <!-- 3D perspective dice -->
  <svg xmlns="http://www.w3.org/2000/svg" width="1.7rem" height="1.7rem" viewBox="0 0 100 100" fill="none">
    <!-- Left face (darker) -->
    <path
      d="M10,35 L10,75 L45,95 L45,55 Z"
      fill="currentColor"
      opacity="0.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Right face (medium) -->
    <path
      d="M45,55 L45,95 L85,75 L85,35 Z"
      fill="currentColor"
      opacity="0.7"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Top face (brightest) -->
    <path
      d="M45,15 L10,35 L45,55 L85,35 Z"
      fill="currentColor"
      opacity="0.9"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Dots on left face (3) -->
    <circle cx="22" cy="54" r="2.5" fill="#000" opacity="0.6" />
    <circle cx="28" cy="65" r="2.5" fill="#000" opacity="0.6" />
    <circle cx="34" cy="76" r="2.5" fill="#000" opacity="0.6" />

    <!-- Dots on right face (2) -->
    <circle cx="58" cy="58" r="2.5" fill="#000" opacity="0.7" />
    <circle cx="72" cy="72" r="2.5" fill="#000" opacity="0.7" />

    <!-- Dot on top face (1) -->
    <circle cx="47.5" cy="35" r="3.5" fill="#000" opacity="0.8" />
  </svg>
</template>
