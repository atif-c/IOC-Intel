# IOC Intel

A powerful and flexible browser extension for investigating Indicators of Compromise (IOCs). Use configurable right-click context menu for selected highlighted IOCs and opens threat intelligence links for efficient analysis.

## Download

Get IOC Intel from your browser's extension store:

-   [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/ioc-intel)
-   [Chrome](https://chromewebstore.google.com/detail/ioc-intel/nepfimakbjcpoanlcdceklibepapeann)
-   [Edge](https://microsoftedge.microsoft.com/addons/detail/ioc-intel/iindoakkhkejhloloffajdkbdbeblnpa)

## Features

-   Lookup:

    -   **IPv4 / IPv6 addresses**
    -   **Hashes**: MD5, SHA-1, SHA-256
    -   **URLs** and **domains**

-   Customisable settings:
    -   Enable/disable IOC types: IP, hash, URL
    -   Enable/disable:
        -   Auto-copy to clipboard
        -   Sanitisation (e.g., `192.168.1[.]1`, `example[.]com`)
    -   Define your own intel URLs with dynamic placeholders
-   Opens intel links in background tabs for fast access

## Supported Placeholders

You can define custom threat intel URLs with these dynamic values:

| Placeholder    | Description                            |
| -------------- | -------------------------------------- |
| `{ip}`         | Raw IP address                         |
| `{hash}`       | Raw hash (MD5/SHA-1/SHA-256)           |
| `{url}`        | Raw URL                                |
| `{encodedUrl}` | URL-encoded version of `{url}`         |
| `{domain}`     | Domain extracted from the selected URL |

## Try Online

Test the extension with this mock webpage: [IOC Intel Demo](https://atif-c.github.io/IOC-Intel/test-iocs)

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

You can include multiple URLs per IOC type

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

1. Highlight an IP, hash, or URL
2. Right-click and choose `IOC Intel`
3. Intel links open in background tabs
4. If enabled, the IOC is copied (and sanitised)

## IOC Types & Validation

-   **IP Addresses**: IPv4 and IPv6
-   **Hashes**: MD5 (32 chars), SHA-1 (40 chars), SHA-256 (64 chars)
-   **URLs**:

## Browser Permissions Used

| Permission       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `clipboardWrite` | Copies IOCs to clipboard                   |
| `contextMenus`   | Adds right-click options                   |
| `storage`        | Saves user settings                        |
| `tabs`           | Opens threat intel URLs in background tabs |

## Development

### Building from Source

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/ioc-intel.git
    cd ioc-intel
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Build the extension**:

    ```bash
    npm run build
    ```

    This creates:

-   Unpacked extensions in `dist/chrome/` and `dist/firefox/`
-   Zipped `.zip` files ready for publishing or sideloading

### Live Development

For active development with automatic reloading:

```bash
npm run dev
```

This uses `web-ext` to:

-   Launch Firefox with the extension loaded
-   Auto-reload the extension when source files change
-   Provide live development feedback

### Manual Installation

#### Firefox

1. Open `about:debugging#/runtime/this-firefox` in your address bar
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file in the `dist/firefox/` folder

#### Chrome

1. Open `chrome://extensions/` in your address bar
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/chromium/` folder

#### Edge

1. Open `edge://extensions/` in your address bar
2. Enable **Developer mode** (bottom-left toggle)
3. Click **Load unpacked**
4. Select the `dist/chromium/` folder (Edge uses Chromium format)

### File Structure

```
ioc-intel/
├── build.js                            # Build script for Firefox/Chromium extensions
├── web-ext-config.mjs                  # Firefox web-ext development configuration
├── src/                                # Source files (editable)
│   ├── assets/                         # Static assets (icons, fonts, images)
│   │
│   ├── lib/                            # Core application libraries
│   │   ├── IOC/                        # IOC validation and processing logic
│   │   ├── browser/                    # Browser extension interaction layer
│   │   ├── components/                 # Reusable Svelte UI components
│   │   └── storage/                    # Data persistence and state management
│   │
│   ├── manifests/                      # Extension manifest definitions
│   │   ├── manifest.base.json
│   │   ├── manifest.chromium.json      # Merged with base for Chromium builds
│   │   └── manifest.firefox.json       # Merged with base for Firefox builds
│   │
│   └── popup/                          # Extension popup window implementation
│
└── dist/                               # Build output (ignored by Git)
    ├── firefox/
    ├── chromium/
    ├── firefox.zip
    └── chromium.zip
```

---

### Attribution

Satellite emoji icon by [Twemoji](https://github.com/twitter/twemoji), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
