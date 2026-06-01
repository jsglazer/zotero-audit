/* bootstrap.js — Zotero Audit v1.0.10
 * Zotero 7+ bootstrapped extension entry point.
 * chrome.manifest is NOT auto-processed; must be registered via
 * aomStartup.registerChrome() in startup() so chrome:// URLs resolve.
 */

var ZoteroAudit = {
  _dialog: null,
  _chromeHandle: null,

  async startup({ id, version, rootURI }) {
    await Zotero.initializationPromise;

    // Register chrome package so chrome://zotero-audit/content/ resolves
    const aomStartup = Components.classes[
      "@mozilla.org/addons/addon-manager-startup;1"
    ].getService(Components.interfaces.amIAddonManagerStartup);
    this._chromeHandle = aomStartup.registerChrome(
      Services.io.newURI(rootURI + "chrome.manifest"),
      [["content", "zotero-audit", "chrome/content/"]]
    );

    const prefKey = "extensions.zotero-audit.installed";
    const isFirstRun = !Services.prefs.prefHasUserValue(prefKey);
    if (isFirstRun) Services.prefs.setBoolPref(prefKey, true);

    let shownWelcome = false;
    for (const win of Zotero.getMainWindows()) {
      if (!win.ZoteroPane) continue;
      this._addKeybinding(win);
      this._addMenuItem(win);
      if (isFirstRun && !shownWelcome) {
        shownWelcome = true;
        win.setTimeout(() => this._showWelcome(win), 500);
      }
    }
  },

  shutdown() {
    if (this._dialog && !this._dialog.closed) this._dialog.close();
    this._dialog = null;

    if (this._chromeHandle) {
      this._chromeHandle.destruct();
      this._chromeHandle = null;
    }
  },

  onMainWindowLoad({ window }) {
    this._addKeybinding(window);
    this._addMenuItem(window);
  },

  onMainWindowUnload({ window }) {
    window.document.getElementById("zotero-audit-keyset")?.remove();
    window.document.getElementById("zotero-audit-menuitem")?.remove();
  },

  _addKeybinding(win) {
    const doc = win.document;
    if (doc.getElementById("zotero-audit-keyset")) return;

    const keyset = doc.createXULElement("keyset");
    keyset.id = "zotero-audit-keyset";

    const key = doc.createXULElement("key");
    key.id = "zotero-audit-key";
    key.setAttribute("key", "A");
    key.setAttribute("modifiers", "accel shift");
    key.addEventListener("command", () => this._openDialog(win));

    keyset.appendChild(key);
    doc.documentElement.appendChild(keyset);
  },

  _addMenuItem(win) {
    const doc = win.document;
    if (doc.getElementById("zotero-audit-menuitem")) return;
    const popup = doc.getElementById("menu_ToolsPopup");
    if (!popup) return;

    const item = doc.createXULElement("menuitem");
    item.id = "zotero-audit-menuitem";
    item.setAttribute("label", "Audit Library…");
    item.setAttribute("key", "zotero-audit-key");
    item.addEventListener("command", () => this._openDialog(win));
    popup.appendChild(item);
  },

  _showWelcome(win) {
    Services.prompt.alert(
      win,
      "Zotero Audit",
      "Thank you for installing the Zotero Audit plugin.\n\nAudit offers a fast way to ensure the minimal essential metadata fields are populated. You can edit fields directly in the table.\n\nPlease submit any issues on the GitHub page:\nhttps://github.com/jsglazer/zotero-audit/"
    );
  },

  _openDialog(win) {
    if (this._dialog && !this._dialog.closed) {
      this._dialog.focus();
      return;
    }
    this._dialog = win.openDialog(
      "chrome://zotero-audit/content/audit.html",
      "zotero-audit-dialog",
      "chrome,dialog=no,resizable,centerscreen,width=1200,height=700",
      Zotero
    );
  },
};

function install() {}
function uninstall() {}
async function startup(data) { await ZoteroAudit.startup(data); }
function shutdown(data) { ZoteroAudit.shutdown(); }
function onMainWindowLoad(data) { ZoteroAudit.onMainWindowLoad(data); }
function onMainWindowUnload(data) { ZoteroAudit.onMainWindowUnload(data); }
