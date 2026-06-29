---
title: ThemePicker
description: A visual theme configuration component.
category: advanced
seo:
  title: ThemePicker
  description: A visual theme configuration component to switch colors, radius, fonts, icon set and dark mode, with CSS/config export.
---

## Introduction

`MThemePicker` is a visual theme configuration component that allows users to preview and customize the application theme in real time. It unifies adjustments to `primary`, `neutral`, border-radius, fonts, icon sets, and color mode, with support for exporting CSS variables and `app.config.ts` configuration code.

::note{to="https://github.com/nuxt/ui/tree/v4/docs/app/components/theme-picker"}
Configuration changes are stored locally and automatically restored on the next visit. The component source originates from Nuxt UI.
::

::note
`MThemePicker` is part of the theme module. If [`movk.theme.enabled`](/docs/getting-started/configuration#theme) is set to `false`, this component will not be registered.
::

## Usage

`MThemePicker` is typically used as a global theme configuration entry, placed in the application header or toolbar:

::tip
The current theme tokens update immediately after panel operations, making it easy to verify configuration changes. Use [`useTheme`](/docs/composables/use-theme) to read reactive state:
::

::component-example
---
name: ComponentsThemePickerStateExample
---
::

## Features

### Primary Color Configuration

- **Primary**: Choose the main brand color, supporting black or preset colors
- **Neutral**: Configure neutral tones affecting text and backgrounds

### Style Configuration

- **Radius**: Adjust global border-radius size (0–5 levels)
- **Font**: Select font family (default font: Alibaba PuHuiTi)
- **Icons**: Switch icon sets (Lucide, Phosphor, Tabler)

### Color Mode

Three color modes are supported:
- `light`: Light mode
- `dark`: Dark mode
- `system`: Follow system preference

### Export Configuration

Once configured, you can export:
- `main.css`: CSS variable configuration
- `app.config.ts`: Application configuration code

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/theme-picker"}
