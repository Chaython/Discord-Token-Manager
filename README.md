# 🔑 Discord Token Getter & Login Helper

![Version](https://img.shields.io/badge/Version-3.6-blue.svg?style=for-the-badge)
![Discord](https://img.shields.io/badge/Discord-Apps-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Script-green?style=for-the-badge)

A powerful Userscript that allows you to extract your Discord token, log in instantly via token (bypassing 2FA/email), and manage **lists of accounts** with a powerful batch validator.

## 📥 Installation

1.  Install a Userscript manager:
    * **Chrome/Brave/Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * **Firefox:** [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
2.  **[Click Here to Install Script](https://update.greasyfork.org/scripts/529038/Discord%20Token%20Getter.user.js)**

---

## ✨ Features

### 1. 📂 Advanced Batch Manager (New in v3.0)
A fully-featured tab dedicated to managing bulk accounts.
* **Bulk Validation:** Paste a list of tokens (one per line). The script checks them all against the Discord API (`/users/@me`) to verify they are working.
* **Line Number Editor:** A code-editor style input box with line numbers, making it easy to track which token belongs to which account.
* **Visual Feedback:** Results show the username (if valid) or "Invalid/Locked".
* **One-Click Action:** Every valid result gets a **Login** button (instant switch) and a **Copy** button.
* **Persistence:** Your list is saved automatically. If you reload the page, your batch list remains intact.

### 2. 🛠️ Floating Tools Panel
A sleek, draggable, and **resizable** panel that lives in the corner of your screen.
* **Resizable UI:** Drag the corner to expand the panel—perfect for managing long lists of tokens.
* **Logged In:** One-click "Copy Token" button and "Native Logout".
* **Quick Switch:** Already logged in? Paste another token into the "Quick Login" field to switch accounts instantly without logging out first.
* **Minimizable:** Click the `_` icon to shrink the panel into a discreet 🔑 icon.

### 3. ⚡ Native UI Injection
Seamlessly integrates into Discord's native **"Add Account"** modal (Switch Accounts → Add Account).
* Adds a **"Login with Token"** input field directly below the standard password/email fields.
* Matches Discord's native styling perfectly (Dark/Light mode compatible).

### 4. 🛡️ Advanced Extraction
* **Network Sniffing:** Automatically captures the token from Discord's internal background requests (`Authorization` header), ensuring 100% reliability even if Discord updates their Webpack modules.
* **Sandbox Escape:** Uses `unsafeWindow` to ensure console commands work in the main browser context.

---

## 📜 Changelog

### **v3.6** — *The Editor Update*
* 🔢 **Line Numbers:** Added a sidebar to the batch input box showing line numbers.
* 🏷️ **Visual Tags:** Batch results now display the corresponding line number (e.g., `#5`) so you can easily find the token in your list.
* ↔️ **No-Wrap Mode:** Input box now scrolls horizontally to keep long tokens aligned with line numbers.

### **v3.5** — *Resizable & Responsive*
* 📐 **Resizable UI:** You can now drag the bottom-right corner to resize the panel.
* 📱 **Smart Scaling:** The input areas and token lists automatically expand to fill the new size.

### **v3.2 - v3.4** — *Quality of Life*
* 💾 **Persistence:** The script now remembers your token list and which tab you were on after a page reload.
* 📋 **Batch Actions:** Added individual "Copy" buttons to batch results.
* 🛡️ **Safety Loader:** Added a delay mechanism to ensure the script doesn't inject before Discord's React app is fully hydrated.

### **v3.0** — *The Batch Era*
* 📂 **Tabbed Interface:** Split the UI into "Single" and "Batch" modes.
* ✅ **Bulk Checker:** Added the ability to validate hundreds of tokens at once without logging in.
* 🚦 **Status Indicators:** Visual Green/Red indicators for token validity.

### **v2.9** — *Auto-Update & Greasy Fork*
* 🔗 **Integration:** Added Greasy Fork update headers.

---

## ⚠️ Disclaimer
* **Security:** Never share your token with anyone. A token gives full access to your account.
* **ToS:** Using "self-bots" or automating user accounts is against Discord Terms of Service. This script is intended for educational purposes and personal account management. Use at your own risk.

---

<div align="center">
  <sub>Built with ❤️ by Chaython</sub>
</div>
