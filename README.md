# 🔑 Discord Token Getter & Login Helper

![Version](https://img.shields.io/badge/Version-2.9-blue.svg?style=for-the-badge)
![Discord](https://img.shields.io/badge/Discord-Apps-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Script-green?style=for-the-badge)

A powerful Userscript that allows you to extract your Discord token, log in instantly via token (bypassing 2FA/email), and manage multiple accounts with ease.

## 📥 Installation

1.  Install a Userscript manager:
    * **Chrome/Brave/Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * **Firefox:** [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
2.  **[Click Here to Install Script](https://update.greasyfork.org/scripts/529038/Discord%20Token%20Getter.user.js)**

---

## ✨ Features

### 1. 🛠️ Floating Tools Panel
A sleek, draggable, and minimizable panel that lives in the corner of your screen.
* **Logged In:** One-click "Copy Token" button and "Native Logout".
* **Logged Out:** A dedicated "Paste Token" box to log in instantly.
* **Quick Switch:** Already logged in? Paste another token into the "Quick Login" field to switch accounts instantly without logging out first.
* **Minimizable:** Click the `_` icon to shrink the panel into a discreet 🔑 icon.

### 2. ⚡ Native UI Injection
Seamlessly integrates into Discord's native **"Add Account"** modal (Switch Accounts → Add Account).
* Adds a **"Login with Token"** input field directly below the standard password/email fields.
* Matches Discord's native styling perfectly (Dark/Light mode compatible).

### 3. 🖥️ Console Commands
Power user? Access functions directly from the DevTools Console (`F12`):
* `token` → Prints your current token to the console and auto-copies it to the clipboard.
* `tokenlogin('YOUR_TOKEN')` → Instantly logs you in using the provided token string.

### 4. 🛡️ Advanced Extraction (New in v2.x)
* **Network Sniffing:** Automatically captures the token from Discord's internal background requests (`Authorization` header), ensuring 100% reliability even if Discord updates their Webpack modules.
* **Sandbox Escape:** Uses `unsafeWindow` to ensure console commands work in the main browser context.

---

## 📜 Changelog

### **v2.9** — *Auto-Update & Greasy Fork*
* 🔗 **Integration:** Added Greasy Fork update headers. The script will now automatically check for updates and install new versions.

### **v2.7** — *The Console Power Update*
* 💻 **Console API:** Added `tokenlogin()` command for programmatic logins.
* ✨ **Refinement:** Improved `token` command to return the string for manual copying if clipboard permissions are blocked.

### **v2.6** — *UI Polish*
* 📉 **Minimize:** The panel can now be minimized to a small floating icon.
* 🚀 **Quick Switch:** Added a login field to the *logged-in* state for fast account swapping.
* ❌ **Controls:** Added proper Close and Minimize buttons.

### **v2.4** — *The "Sniffer" Fix*
* 🧠 **Core Logic Change:** Switched to a hybrid **Network Sniffer** approach.
    * *Why?* Discord obfuscates their internal variables.
    * *How?* We now intercept the `Authorization` header from legitimate network requests. This is unpatchable as long as the client needs to talk to the server.

### **v2.2** — *Native Aesthetics*
* 🎨 **Redesign:** The "Add Account" modal injection now uses a native-style Input Field & Submit Button instead of a generic prompt.

### **v2.0** — *The GUI Update*
* 📦 **Major Release:** Introduced the Floating GUI Panel.
* 🔓 **Login Bypass:** Implemented `iframe` + `localStorage` injection to bypass login wrappers.

---

## ⚠️ Disclaimer
* **Security:** Never share your token with anyone. A token gives full access to your account.
* **ToS:** Using "self-bots" or automating user accounts is against Discord Terms of Service. This script is intended for educational purposes and personal account management. Use at your own risk.

---

<div align="center">
  <sub>Built with ❤️ by Chaython</sub>
</div>
