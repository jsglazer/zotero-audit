/* bootstrap.js — Zotero Audit v1.0.5
 * Zotero 9 bootstrapped extension entry point.
 * Dialog uses chrome://zotero-audit/content/audit.html (registered via
 * chrome.manifest) so it runs with full chrome privileges and can access
 * Components.classes / Zotero directly — no bridge needed.
 */

var ZoteroAudit = {
  _dialog: null,

  async startup({ id, version, rootURI }) {
    await Zotero.initializationPromise;

    for (const win of Zotero.getMainWindows()) {
      if (!win.ZoteroPane) continue;
      this._addMenuItem(win);
    }
  },

  shutdown() {
    if (this._dialog && !this._dialog.closed) this._dialog.close();
    this._dialog = null;
  },

  onMainWindowLoad({ window }) {
    this._addMenuItem(window);
  },

  onMainWindowUnload({ window }) {
    window.document.getElementById("zotero-audit-menuitem")?.remove();
  },

  _addMenuItem(win) {
    const doc = win.document;
    if (doc.getElementById("zotero-audit-menuitem")) return;
    const popup = doc.getElementById("menu_ToolsPopup");
    if (!popup) return;

    const item = doc.createXULElement("menuitem");
    item.id = "zotero-audit-menuitem";
    item.setAttribute("label", "Audit Library…");
    item.addEventListener("command", () => this._openDialog(win));
    popup.appendChild(item);
  },

  _openDialog(win) {
    if (this._dialog && !this._dialog.closed) {
      this._dialog.focus();
      return;
    }
    this._dialog = win.openDialog(
      "chrome://zotero-audit/content/audit.html",
      "zotero-audit-dialog",
      "chrome,dialog=no,resizable,centerscreen,width=1200,height=700"
    );
  },
};

function install() {}
function uninstall() {}
async function startup(data) { await ZoteroAudit.startup(data); }
function shutdown(data) { ZoteroAudit.shutdown(); }
function onMainWindowLoad(data) { ZoteroAudit.onMainWindowLoad(data); }
function onMainWindowUnload(data) { ZoteroAudit.onMainWindowUnload(data); }
