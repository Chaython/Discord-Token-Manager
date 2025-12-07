// ==UserScript==
// @name         Discord Token Getter & Login Helper
// @icon https://www.google.com/s2/favicons?domain=discord.com&sz=256
// @namespace    http://tampermonkey.net/
// @version      2.10
// @description  Get Token, Login via Token (Main Page, Add Account, Console), Minimizable Panel. Repo: https://github.com/Chaython/Discord-Token-Manager
// @author       Chaython
// @homepageURL  https://github.com/Chaython/Discord-Token-Manager
// @supportURL   https://github.com/Chaython/Discord-Token-Manager/issues
// @updateURL    https://update.greasyfork.org/scripts/529038/Discord%20Token%20Getter.meta.js
// @downloadURL  https://update.greasyfork.org/scripts/529038/Discord%20Token%20Getter.user.js
// @match        https://discord.com/*
// @grant        GM_addStyle
// @grant        GM_notification
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

    // --- Network Sniffer ---
    // Intercepts the "Authorization" header from Discord's internal requests.
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
                border: 1px solid #202225; display: flex; flex-direction: column;
                width: 220px; transition: all 0.2s ease;
            }
            .dtg-panel.minimized {
                width: 40px; height: 40px; overflow: hidden; border-radius: 50%;
                cursor: pointer; background-color: #5865f2; border: 2px solid #fff;
                align-items: center; justify-content: center;
            }
            .dtg-panel.minimized .dtg-header, 
            .dtg-panel.minimized .dtg-content { display: none; }
            .dtg-panel.minimized::after {
                content: '🔑'; font-size: 20px; line-height: 40px;
            }
            
            .dtg-header {
                background-color: #5865f2; color: white; padding: 8px 12px;
                font-weight: 600; font-size: 14px; display: flex; justify-content: space-between;
                align-items: center;
            }
            .dtg-controls { display: flex; gap: 8px; }
            .dtg-icon-btn { cursor: pointer; opacity: 0.8; font-weight: bold; }
            .dtg-icon-btn:hover { opacity: 1; }

            .dtg-content { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
            
            .dtg-btn {
                background-color: #4f545c; color: white; border: none; padding: 8px;
                border-radius: 4px; cursor: pointer; font-size: 13px; text-align: center;
                transition: background 0.2s;
            }
            .dtg-btn:hover { background-color: #686d73; }
            .dtg-btn.primary { background-color: #5865f2; }
            .dtg-btn.primary:hover { background-color: #4752c4; }
            .dtg-btn.danger { background-color: #ed4245; }
            .dtg-btn.danger:hover { background-color: #c03537; }

            .dtg-input {
                background-color: #202225; border: 1px solid #202225; color: white;
                padding: 8px; border-radius: 4px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box;
            }
            .dtg-input:focus { border-color: #5865f2; }

            .dtg-separator { height: 1px; background-color: #40444b; margin: 4px 0; }
            
            /* Modal Styles */
            .dtg-modal-separator { width: 100%; height: 1px; background-color: #4f545c; margin: 20px 0 16px 0; position: relative; }
            .dtg-modal-separator span { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background-color: #36393f; padding: 0 8px; color: #72767d; font-size: 12px; font-weight: 600; }
            .dtg-token-row { display: flex; gap: 10px; height: 40px; }
            .dtg-token-input-wrapper { flex: 1; background-color: #202225; border-radius: 3px; display: flex; align-items: center; padding: 1px; }
            .dtg-token-input { width: 100%; background: transparent; border: none; padding: 0 10px; color: #dcddde; font-size: 16px; outline: none; height: 100%; }
            .dtg-token-submit { background-color: #5865f2; color: white; border: none; border-radius: 3px; padding: 0 24px; font-weight: 500; cursor: pointer; white-space: nowrap; }
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
            // Webpack fallback
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

    const copyTokenSafe = () => {
        const t = getToken();
        if(t) { 
            navigator.clipboard.writeText(t).catch(err => prompt("Copy your token:", t)); 
        } else {
            alert('Token not found yet. Switch channels to generate traffic.');
        }
    };

    // --- Feature 1: Console "token" Command ---
    Object.defineProperty(scope, 'token', {
        get: function() {
            const t = getToken();
            if (t) {
                console.log('%c[Discord Token]', 'color: #5865f2; font-weight: bold; font-size: 14px;', t);
                navigator.clipboard.writeText(t).then(() => console.log('%cCopied!', 'color: green')).catch(() => {});
                return t;
            } else return "Token not found yet.";
        },
        configurable: true
    });

    // --- Feature 4: Console "tokenlogin" Command ---
    scope.tokenlogin = (token) => {
        if (token) {
            loginWithToken(token);
            return "Attempting login...";
        } else {
            return "Usage: tokenlogin('YOUR_TOKEN_HERE')";
        }
    };

    // --- Feature 2: Minimizable Floating Panel ---
    const createPanel = () => {
        if (document.getElementById('dtg-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'dtg-panel';
        panel.className = 'dtg-panel';

        // Toggle Minimize on click when already minimized
        panel.addEventListener('click', (e) => {
            if (panel.classList.contains('minimized')) {
                panel.classList.remove('minimized');
                isMinimized = false;
            }
        });

        const isLoginPage = window.location.href.includes('/login') || window.location.href.includes('/register');
        
        let content = '';
        if (!isLoginPage) {
            // Logged In View
            content = `
                <div class="dtg-header">
                    <span>Token Tools</span>
                    <div class="dtg-controls">
                        <span class="dtg-icon-btn" id="dtg-min">_</span>
                        <span class="dtg-icon-btn" id="dtg-close">✕</span>
                    </div>
                </div>
                <div class="dtg-content">
                    <button id="dtg-copy" class="dtg-btn primary">Copy My Token</button>
                    <div class="dtg-separator"></div>
                    
                    <input id="dtg-quick-input" class="dtg-input" type="password" placeholder="Login with another token">
                    <button id="dtg-quick-login" class="dtg-btn">Login</button>
                    
                    <div class="dtg-separator"></div>
                    <button id="dtg-logout" class="dtg-btn danger">Native Logout</button>
                </div>`;
        } else {
            // Logged Out View
            content = `
                <div class="dtg-header">
                    <span>Login Helper</span>
                    <div class="dtg-controls">
                        <span class="dtg-icon-btn" id="dtg-min">_</span>
                        <span class="dtg-icon-btn" id="dtg-close">✕</span>
                    </div>
                </div>
                <div class="dtg-content">
                    <input id="dtg-input-token" class="dtg-input" type="password" placeholder="Paste Token Here">
                    <button id="dtg-login-btn" class="dtg-btn primary">Login with Token</button>
                </div>`;
        }

        panel.innerHTML = content;
        document.body.appendChild(panel);

        // --- Event Listeners ---
        const minBtn = document.getElementById('dtg-min');
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                panel.classList.add('minimized');
                isMinimized = true;
            });
        }
        const closeBtn = document.getElementById('dtg-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.remove();
            });
        }

        if (!isLoginPage) {
            document.getElementById('dtg-copy').addEventListener('click', (e) => { e.stopPropagation(); copyTokenSafe(); });
            document.getElementById('dtg-quick-login').addEventListener('click', (e) => { 
                e.stopPropagation(); 
                loginWithToken(document.getElementById('dtg-quick-input').value); 
            });
            document.getElementById('dtg-logout').addEventListener('click', (e) => { e.stopPropagation(); window.location.href = '/login'; });
            document.getElementById('dtg-quick-input').addEventListener('click', (e) => e.stopPropagation());
        } else {
            document.getElementById('dtg-login-btn').addEventListener('click', (e) => { 
                e.stopPropagation();
                loginWithToken(document.getElementById('dtg-input-token').value); 
            });
            document.getElementById('dtg-input-token').addEventListener('click', (e) => e.stopPropagation());
        }
    };

    // --- Feature 3: Modal Injection (Add Account) ---
    const runObserver = () => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const isModal = node.querySelector('div[data-mana-component="modal"]');
                            if (isModal) {
                                const header = isModal.querySelector('h1');
                                if (header && header.textContent.includes('Add Account')) {
                                    const loginContainer = isModal.querySelector('div[class*="mainLoginContainer"]');
                                    if (loginContainer && !loginContainer.querySelector('.dtg-modal-injection')) {
                                        const wrapper = document.createElement('div');
                                        wrapper.className = 'dtg-modal-injection';
                                        wrapper.innerHTML = `
                                            <div class="dtg-modal-separator"><span>OR</span></div>
                                            <div class="dtg-token-row">
                                                <div class="dtg-token-input-wrapper">
                                                    <input type="password" class="dtg-token-input" placeholder="Login with token">
                                                </div>
                                                <button class="dtg-token-submit">Login</button>
                                            </div>`;
                                        
                                        const btn = wrapper.querySelector('.dtg-token-submit');
                                        const input = wrapper.querySelector('.dtg-token-input');
                                        const doLogin = () => { if(input.value) loginWithToken(input.value); };
                                        
                                        btn.onclick = doLogin;
                                        input.onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };
                                        loginContainer.appendChild(wrapper);
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // --- Init ---
    const init = () => {
        setupStyles();
        createPanel();
        runObserver();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
