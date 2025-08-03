# IOC Intel

A powerful and flexible browser extension for investigating Indicators of Compromise (IOCs). It adds a configurable right-click context menu for selected content and opens threat intelligence links in for efficient analysis.

## Features

-   Detects and validates:
    -   **IPv4 / IPv6 addresses**
    -   **Hashes**: MD5, SHA-1, SHA-256
    -   **URLs** and **domains**
-   Customizable behavior via settings:
    -   Enable/disable IOC types: IP, hash, URL
    -   Enable/disable:
        -   Auto-copy to clipboard
        -   Sanitisation (e.g., `192.168.1[.]1`, `example[.]com`)
    -   Define your own intel URLs with smart placeholders
-   Opens matching threat intelligence URLs in background tabs.

## Supported Placeholders

You can define custom threat intel URLs with these dynamic values:

| Placeholder    | Description                            |
| -------------- | -------------------------------------- |
| `{ip}`         | Raw IP address                         |
| `{hash}`       | Raw hash (MD5/SHA-1/SHA-256)           |
| `{url}`        | Raw URL                                |
| `{encodedUrl}` | URL-encoded version of `{url}`         |
| `{domain}`     | Domain extracted from the selected URL |

## Installation Instructions

### Chrome

1. Open `chrome://extensions/` in your address bar.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the folder containing `manifest.json` and `background.js`.

### Firefox

1. Open `about:debugging#/runtime/this-firefox` in your address bar.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` file in your extension folder.

### Edge

1. Open `edge://extensions/` in your address bar.
2. Enable **Developer mode** (bottom-left toggle).
3. Click **Load unpacked**.
4. Select the folder containing your extension files.

## Configuration

After installing, open the extension's **Options** page to:

-   Enable/disable types of IOCs to monitor
-   Toggle:
    -   Clipboard copying
    -   IOC sanitisation
-   Set your own threat intel URLs for:
    -   IP addresses
    -   Hashes
    -   URLs

You can include multiple URLs per IOC type.

Example intel URL for IP:

```
https://www.abuseipdb.com/check/{ip}
```

Example intel URL for hash:

```
https://www.virustotal.com/gui/file/{hash}/details
```

Example intel URL for URL:

```
https://urlhaus.abuse.ch/browse.php?search={encodedUrl}
```

## Example Usage

1. Highlight any IP address, file hash, or URL on a webpage.
2. Right-click and choose `IOC Intel`.
3. Intelligence links will open in background tabs.
4. If enabled, the IOC will be sanitised and copied to your clipboard.

## IOC Types & Validation

-   **IP Addresses**: IPv4 and IPv6
-   **Hashes**: MD5 (32 chars), SHA-1 (40 chars), SHA-256 (64 chars)
-   **URLs**:

## Browser Permissions Used

| Permission       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `clipboardWrite` | Writes IOCs to clipboard                   |
| `contextMenus`   | Adds right-click options for selected IOCs |
| `storage`        | Saves user settings and configuration      |
| `tabs`           | Opens new tabs for threat intel URLs       |

## Project Structure

```
ioc-intel/
├── build.js                  # Build script for Firefox/Chromium
├── package.json
├── package-lock.json
├── web-ext-config.mjs        # Firefox extension config
├── src/                      # Source files (editable)
│   ├── assets/
│   │   ├── logo/
│   │   └── fonts/
│   │
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
│   │
│   ├── lib/
│   │   ├── background.js
│   │   ├── browser-polyfill.min.js
│   │   ├── checkboxes.js
│   │   ├── ioc-validator.js
│   │   ├── preferences.js
│   │   └── tabs.js
│   │
│   ├── manifest.base.json
│   ├── manifest.chromium.json      # Merged with base for Chromium builds
│   └── manifest.firefox.json       # Merged with base for Firefox builds
│
└── dist/                     # Build output (ignored by Git)
    ├── chrome/
    └── firefox/
```

---

### Attribution

Satellite emoji icon by [Twemoji](https://github.com/twitter/twemoji), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
