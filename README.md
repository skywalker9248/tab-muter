# Tab Muter

A minimal Chrome extension that mutes the current tab for a set duration and automatically unmutes when the timer expires.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)

## Features

- **One-click mute** with a countdown timer
- **Default duration: 2m 30s** (150 seconds) — ideal for IPL timeouts
- **Preset buttons**: 1m / 2m 30s / 5m / 10m
- **Custom duration**: enter any number of seconds
- **Auto-unmute** when timer expires — works even if the popup is closed
- **Unmute Now** button to cancel early

## Installation

1. Clone or download this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `tab-muter` folder
6. Pin the extension from the toolbar puzzle-piece icon

## Usage

1. Navigate to any tab playing audio
2. Click the **Tab Muter** icon in the toolbar
3. Choose a preset or enter a custom duration in seconds
4. Click **Mute for X** — the tab is silenced and a countdown begins
5. The tab unmutes automatically when the timer hits zero, or click **Unmute Now** to cancel early

## Project Structure

```
tab-muter/
├── manifest.json     # Chrome MV3 manifest
├── background.js     # Service worker — handles mute/unmute logic & alarms
├── popup.html        # Extension popup UI
└── popup.js          # Popup state, countdown timer, preset buttons
```

## How It Works

- Uses `chrome.tabs.update` to mute/unmute tabs
- Uses `chrome.alarms` for the auto-unmute timer — reliable even when the service worker is suspended
- Stores the mute end-time in `chrome.storage.session` so the countdown survives popup close/reopen

## Permissions

| Permission | Reason |
|-----------|--------|
| `tabs` | Mute/unmute the active tab |
| `alarms` | Schedule auto-unmute after the timer |
| `storage` | Persist countdown state across popup open/close |
