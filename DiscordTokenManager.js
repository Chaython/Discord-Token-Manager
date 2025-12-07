// ==UserScript==
// @name         Discord Token Manager
// @icon         https://www.google.com/s2/favicons?domain=discord.com&sz=256
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Get Token, Login via Token, Batch Token Validator & Switcher (Editor & Line Numbers)
// @author       Chaython
// @homepageURL  https://github.com/Chaython/Discord-Token-Manager
// @supportURL   https://github.com/Chaython/Discord-Token-Manager/issues
// @updateURL    https://update.greasyfork.org/scripts/529038/Discord%20Token%20Manager.meta.js
// @downloadURL  https://update.greasyfork.org/scripts/529038/Discord%20Token%20Manager.user.js
// @match        https://discord.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- Global State ---
    let CAPTURED_TOKEN = null;
    let isMinimized = false;
    const scope = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- Safe Storage Wrappers ---
    const safeGetValue = (key, def) => {
        try { return GM_getValue(key, def); } catch(e) { console.warn('[DTG] Storage Error:', e); return def; }
    };
    const safeSetValue = (key, val) => {
        try { GM_setValue(key, val); } catch(e) { console.warn('[DTG] Storage Error:', e); }
    };

    // --- Network Sniffer ---
    const originalOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = unsafeWindow.XMLHttpRequest.prototype.setRequestHeader;
    unsafeWindow.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header.toLowerCase() === 'authorization' && value) {
            CAPTURED_TOKEN = value;
        }
        return originalSetRequestHeader.apply(this, arguments);
    };

    // --- Styles ---
    const setupStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .dtg-panel {
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                background-color: #2f3136; color: #dcddde; border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: 'Whitney', sans-serif;
                border: 1px solid #202225;
                display: flex; flex-direction: column;
                resize: both; overflow: hidden;
                min-width: 320px; min-height: 400px;
                width: 350px; height: 500px;
            }
            .dtg-panel.minimized {
                width: 40px !important; height: 40px !important;
                resize: none !important;
                overflow: hidden; border-radius: 50%;
                cursor: pointer; background-color: #5865f2; border: 2px solid #fff;
                align-items: center; justify-content: center;
            }
            .dtg-panel.minimized .dtg-header,
            .dtg-panel.minimized .dtg-content,
            .dtg-panel.minimized .dtg-tabs { display: none; }
            .dtg-panel.minimized::after {
                content: '🔑'; font-size: 20px; line-height: 40px;
            }

            .dtg-header {
                background-color: #5865f2; color: white; padding: 8px 12px;
                font-weight: 600; font-size: 14px; display: flex; justify-content: space-between;
                align-items: center; flex-shrink: 0;
            }
            .dtg-controls { display: flex; gap: 8px; }
            .dtg-icon-btn { cursor: pointer; opacity: 0.8; font-weight: bold; }
            .dtg-icon-btn:hover { opacity: 1; }

            .dtg-tabs {
                display: flex; background: #202225; border-bottom: 1px solid #202225;
                flex-shrink: 0;
            }
            .dtg-tab { flex: 1; text-align: center; padding: 8px 0; cursor: pointer; font-size: 12px; color: #8e9297; transition: 0.2s; }
            .dtg-tab:hover { color: #dcddde; background: #292b2f; }
            .dtg-tab.active { color: #fff; background: #2f3136; border-bottom: 2px solid #5865f2; }

            .dtg-content {
                padding: 10px; display: flex; flex-direction: column; gap: 8px;
                flex: 1; overflow-y: auto; min-height: 0;
            }

            .dtg-btn {
                background-color: #4f545c; color: white; border: none; padding: 8px;
                border-radius: 4px; cursor: pointer; font-size: 13px; text-align: center;
                transition: background 0.2s; width: 100%; flex-shrink: 0;
            }
            .dtg-btn:hover { background-color: #686d73; }
            .dtg-btn.primary { background-color: #5865f2; }
            .dtg-btn.primary:hover { background-color: #4752c4; }
            .dtg-btn.danger { background-color: #ed4245; }
            .dtg-btn.success { background-color: #3ba55c; }
            .dtg-btn-group { display: flex; gap: 5px; flex-shrink: 0; }

            .dtg-input {
                background-color: #202225; border: 1px solid #202225; color: white;
                padding: 8px; border-radius: 4px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box;
                flex-shrink: 0;
            }

            /* Editor with Line Numbers */
            .dtg-editor-wrapper {
                display: flex; flex: 1;
                background-color: #202225; border: 1px solid #202225; border-radius: 4px;
                overflow: hidden; position: relative;
                min-height: 100px;
            }
            .dtg-line-numbers {
                width: 30px; background-color: #2f3136; color: #72767d;
                text-align: right; padding: 8px 4px;
                font-family: monospace; font-size: 12px; line-height: 16px;
                overflow: hidden; border-right: 1px solid #18191c;
                user-select: none;
            }
            .dtg-textarea {
                flex: 1; background: transparent; border: none; color: white;
                padding: 8px; font-family: monospace; font-size: 12px; line-height: 16px;
                outline: none; resize: none;
                white-space: pre; overflow: auto; /* No wrap, scroll horizontal */
            }

            .dtg-separator { height: 1px; background-color: #40444b; margin: 4px 0; flex-shrink: 0; }

            /* Batch List Styles */
            .dtg-batch-item {
                display: flex; align-items: center; justify-content: space-between;
                background: #202225; padding: 8px; border-radius: 4px;
                font-size: 12px; margin-bottom: 8px; flex-shrink: 0;
            }
            .dtg-batch-status { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; flex-shrink: 0; }
            .dtg-status-valid { background-color: #3ba55c; box-shadow: 0 0 5px #3ba55c; }
            .dtg-status-invalid { background-color: #ed4245; }

            .dtg-line-tag {
                color: #72767d; font-family: monospace; font-size: 11px; margin-right: 8px;
                background: #2f3136; padding: 1px 4px; border-radius: 3px;
            }

            .dtg-batch-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 5px; }
            .dtg-action-group { display: flex; gap: 4px; }
            .dtg-btn-sm { padding: 4px 8px; font-size: 11px; width: auto; }
        `;
        document.head.appendChild(style);
    };

    // --- Core Login Logic ---
    const loginWithToken = (token) => {
        if (!token) return;
        token = token.replace(/^"|"$/g, '').trim();
        try {
            console.log('%c[DTG] Logging in...', 'color: #5865f2; font-weight: bold;');
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            const localStorage = iframe.contentWindow.localStorage;
            localStorage.setItem('token', `"${token}"`);
            document.body.removeChild(iframe);
            setTimeout(() => window.location.reload(), 300);
        } catch (e) {
            console.error(e);
            alert('Login failed. Check console.');
        }
    };

    // --- Helper Functions ---
    const getToken = () => {
        if (CAPTURED_TOKEN) return CAPTURED_TOKEN;
        try {
            const targetEval = (unsafeWindow || window).eval;
            return targetEval(`
                (webpackChunkdiscord_app.push([[''], {}, e => {
                    m = [];
                    for (let c in e.c) m.push(e.c[c]);
                }]), m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken()
            `);
        } catch (e) {}
        return null;
    };

    const copyTokenSafe = (t) => {
        if(!t) t = getToken();
        if(t) {
            navigator.clipboard.writeText(t).catch(err => prompt("Copy your token:", t));
        } else {
            alert('Token not found yet. Switch channels to generate traffic.');
        }
    };

    const updateLineNumbers = () => {
        const textarea = document.getElementById('dtg-batch-input');
        const numbers = document.getElementById('dtg-line-numbers');
        if(!textarea || !numbers) return;

        const lineCount = textarea.value.split('\n').length;
        // Efficiently rebuild line numbers
        numbers.innerHTML = Array.from({length: lineCount}, (_, i) => i + 1).join('<br>');
    };

    // --- Batch Processor ---
    const validateToken = async (token) => {
        try {
            const response = await fetch('https://discord.com/api/v9/users/@me', {
                headers: { 'Authorization': token }
            });
            if (response.status === 200) {
                const data = await response.json();
                return { valid: true, username: data.username, discriminator: data.discriminator };
            }
            return { valid: false };
        } catch (e) {
            return { valid: false, error: true };
        }
    };

    const runBatchCheck = async () => {
        const textarea = document.getElementById('dtg-batch-input');
        if (!textarea) return;

        const raw = textarea.value;
        // Split by lines but keep track of original index
        const allLines = raw.split(/\r?\n/);

        // Save to storage
        safeSetValue('dtg_saved_tokens', raw);

        const resultsDiv = document.getElementById('dtg-batch-results');
        resultsDiv.innerHTML = '<div style="text-align:center; color:#888;">Checking...</div>';

        let html = '';

        // Loop through all lines
        for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i];
            const token = line.trim();
            const lineNumber = i + 1;

            if (token.length < 5) continue; // Skip empty/garbage lines

            const cleanToken = token.replace(/^"|"$/g, '');
            const res = await validateToken(cleanToken);
            const statusClass = res.valid ? 'dtg-status-valid' : 'dtg-status-invalid';
            const name = res.valid ? `${res.username}` : 'Invalid / Locked';

            const loginBtn = res.valid ? `<button class="dtg-btn dtg-btn-sm primary dtg-action-login" data-token="${cleanToken}">Login</button>` : '';
            const copyBtn = `<button class="dtg-btn dtg-btn-sm dtg-action-copy" data-token="${cleanToken}">Copy</button>`;

            html += `
                <div class="dtg-batch-item">
                    <div style="display:flex; align-items:center; flex:1; min-width:0;">
                        <span class="dtg-batch-status ${statusClass}"></span>
                        <span class="dtg-line-tag">#${lineNumber}</span>
                        <span class="dtg-batch-name" title="${name}">${name}</span>
                    </div>
                    <div class="dtg-action-group">
                        ${copyBtn}
                        ${loginBtn}
                    </div>
                </div>
            `;
            // Update UI progressively
            resultsDiv.innerHTML = html;
            await new Promise(r => setTimeout(r, 200));
        }

        if (!html) resultsDiv.innerHTML = '<div style="text-align:center;">No valid tokens found</div>';

        // Event Delegation for better performance
        resultsDiv.querySelectorAll('.dtg-action-login').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); loginWithToken(btn.dataset.token); });
        });
        resultsDiv.querySelectorAll('.dtg-action-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const t = btn.dataset.token;
                navigator.clipboard.writeText(t).then(() => {
                    const originalText = btn.innerText;
                    btn.innerText = 'Copied!';
                    setTimeout(() => btn.innerText = originalText, 1000);
                });
            });
        });
    };

    // --- UI Creation ---
    const createPanel = () => {
        if (document.getElementById('dtg-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'dtg-panel';
        panel.className = 'dtg-panel';

        panel.innerHTML = `
            <div class="dtg-header">
                <span>Discord Tools</span>
                <div class="dtg-controls">
                    <span class="dtg-icon-btn" id="dtg-min">_</span>
                    <span class="dtg-icon-btn" id="dtg-close">✕</span>
                </div>
            </div>
            <div class="dtg-tabs">
                <div class="dtg-tab active" data-tab="single">Single</div>
                <div class="dtg-tab" data-tab="batch">Batch</div>
            </div>
            <div class="dtg-content" id="dtg-content-single"></div>
            <div class="dtg-content" id="dtg-content-batch" style="display:none;"></div>
        `;

        if(document.body) {
            document.body.appendChild(panel);
        } else return;

        // View: Single
        const renderSingle = () => {
            const container = document.getElementById('dtg-content-single');
            const isLoginPage = window.location.href.includes('/login');

            if (!isLoginPage) {
                container.innerHTML = `
                    <button id="dtg-copy" class="dtg-btn primary">Copy Current Token</button>
                    <div class="dtg-separator"></div>
                    <input id="dtg-quick-input" class="dtg-input" type="password" placeholder="Paste token to switch">
                    <button id="dtg-quick-login" class="dtg-btn">Login</button>
                    <div class="dtg-separator"></div>
                    <button id="dtg-logout" class="dtg-btn danger">Logout</button>
                `;
                document.getElementById('dtg-copy').onclick = () => copyTokenSafe();
                document.getElementById('dtg-quick-login').onclick = () => loginWithToken(document.getElementById('dtg-quick-input').value);
                document.getElementById('dtg-logout').onclick = () => { window.location.href = '/login'; };
            } else {
                container.innerHTML = `
                    <input id="dtg-input-token" class="dtg-input" type="password" placeholder="Paste Token Here">
                    <button id="dtg-login-btn" class="dtg-btn primary">Login</button>
                `;
                document.getElementById('dtg-login-btn').onclick = () => loginWithToken(document.getElementById('dtg-input-token').value);
            }
        };

        // View: Batch (With Line Number Editor)
        const renderBatch = () => {
            const container = document.getElementById('dtg-content-batch');
            container.innerHTML = `
                <div class="dtg-editor-wrapper">
                    <div id="dtg-line-numbers" class="dtg-line-numbers">1</div>
                    <textarea id="dtg-batch-input" class="dtg-textarea" placeholder="Paste list of tokens" spellcheck="false"></textarea>
                </div>
                <div class="dtg-btn-group">
                    <button id="dtg-batch-check" class="dtg-btn success" style="flex:2;">Check & List</button>
                    <button id="dtg-batch-clear" class="dtg-btn danger" style="flex:1;">Clear</button>
                </div>
                <div class="dtg-separator"></div>
                <div id="dtg-batch-results"></div>
            `;

            const input = document.getElementById('dtg-batch-input');
            const lines = document.getElementById('dtg-line-numbers');

            // Editor Logic: Sync scroll and update numbers
            input.addEventListener('scroll', () => { lines.scrollTop = input.scrollTop; });
            input.addEventListener('input', updateLineNumbers);

            // Load saved
            const savedTokens = safeGetValue('dtg_saved_tokens', '');
            if (savedTokens) {
                input.value = savedTokens;
                updateLineNumbers();
            }

            document.getElementById('dtg-batch-check').onclick = runBatchCheck;
            document.getElementById('dtg-batch-clear').onclick = () => {
                input.value = '';
                document.getElementById('dtg-batch-results').innerHTML = '';
                safeSetValue('dtg_saved_tokens', '');
                updateLineNumbers();
            };
        };

        renderSingle();
        renderBatch();

        // Tabs & Controls
        const switchTab = (tabName) => {
            panel.querySelectorAll('.dtg-tab').forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`.dtg-tab[data-tab="${tabName}"]`);
            if(activeTab) activeTab.classList.add('active');

            if (tabName === 'single') {
                document.getElementById('dtg-content-single').style.display = 'flex';
                document.getElementById('dtg-content-batch').style.display = 'none';
            } else {
                document.getElementById('dtg-content-single').style.display = 'none';
                document.getElementById('dtg-content-batch').style.display = 'flex';
                // Trigger line number update on tab switch to fix rendering glitches
                updateLineNumbers();
            }
            safeSetValue('dtg_last_tab', tabName);
        };

        panel.querySelectorAll('.dtg-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        document.getElementById('dtg-min').addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.add('minimized');
            isMinimized = true;
        });

        document.getElementById('dtg-close').addEventListener('click', (e) => {
            e.stopPropagation();
            panel.remove();
        });

        panel.addEventListener('click', (e) => {
            if (panel.classList.contains('minimized')) {
                panel.classList.remove('minimized');
                isMinimized = false;
            }
        });

        const stopProp = (e) => e.stopPropagation();
        const inputs = panel.querySelectorAll('input, textarea, button');
        inputs.forEach(el => el.addEventListener('click', stopProp));

        // Restore State
        const lastTab = safeGetValue('dtg_last_tab', 'single');
        if (lastTab === 'batch') {
            switchTab('batch');
            const savedTokens = safeGetValue('dtg_saved_tokens', '');
            if (savedTokens) {
                setTimeout(runBatchCheck, 500);
            }
        }
    };

    const init = () => {
        setupStyles();
        if (document.readyState === 'complete') {
            createPanel();
        } else {
            window.addEventListener('load', () => { setTimeout(createPanel, 1000); });
        }
    };

    init();

})();
