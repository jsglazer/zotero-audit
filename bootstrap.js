/* bootstrap.js — Zotero Audit v1.0.1
 * Zotero 9 bootstrapped extension entry point.
 * Uses onMainWindowLoad/onMainWindowUnload (Zotero 7+ API).
 * Zotero is available as a global in this context.
 */

var ZoteroAudit = {
  rootURI: null,
  _dialog: null,

  async startup({ id, version, rootURI }) {
    this.rootURI = rootURI;
    await Zotero.initializationPromise;

    // Register resource:// alias so jar: URLs inside the XPI open reliably
    Services.io
      .getProtocolHandler("resource")
      .QueryInterface(Components.interfaces.nsIResProtocolHandler)
      .setSubstitution("zotero-audit", Services.io.newURI(rootURI));
  },

  shutdown() {
    try {
      Services.io
        .getProtocolHandler("resource")
        .QueryInterface(Components.interfaces.nsIResProtocolHandler)
        .setSubstitution("zotero-audit", null);
    } catch (e) {}

    if (this._dialog && !this._dialog.closed) this._dialog.close();
    this._dialog = null;
  },

  // Called by Zotero whenever a main window opens (including on startup)
  onMainWindowLoad({ window }) {
    this._addMenuItem(window);
  },

  // Called by Zotero whenever a main window closes
  onMainWindowUnload({ window }) {
    window.document.getElementById("zotero-audit-menuitem")?.remove();
  },

  // ---------------------------------------------------------------------------
  // Menu
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Dialog
  // ---------------------------------------------------------------------------

  _openDialog(win) {
    if (this._dialog && !this._dialog.closed) {
      this._dialog.focus();
      return;
    }

    const args = {
      loadItems: () => this._loadItems(),
      saveField: (itemID, field, value) => this._saveField(itemID, field, value),
    };

    this._dialog = win.openDialog(
      "resource://zotero-audit/audit.html",
      "zotero-audit-dialog",
      "chrome,dialog=no,resizable,centerscreen,width=1200,height=700",
      args
    );
  },

  // ---------------------------------------------------------------------------
  // Data API — called from the dialog via window.arguments[0]
  // ---------------------------------------------------------------------------

  async _loadItems() {
    const libraryID = Zotero.Libraries.userLibraryID;
    const allItems = await Zotero.Items.getAll(libraryID);

    return allItems
      .filter(item => item.isRegularItem() && !item.deleted)
      .map(item => {
        const dateStr = item.getField("date") || "";
        const creators = item.getCreators();
        const first = creators[0] || null;
        return {
          id: item.id,
          type: this._localizeType(item.itemType),
          citationKey: this._getCitationKey(item),
          title: item.getField("title") || "",
          shortTitle: this._safeGetField(item, "shortTitle"),
          author: first ? this._formatCreator(first) : "",
          year: this._parseYear(dateStr),
          month: this._parseMonth(dateStr),
        };
      });
  },

  async _saveField(itemID, field, value) {
    const item = await Zotero.Items.getAsync(itemID);
    if (!item) return;

    try {
      switch (field) {
        case "type": {
          const typeID = Zotero.ItemTypes.getID(this._unlocalizeType(value));
          if (typeID) item.setType(typeID);
          break;
        }
        case "citationKey": {
          let extra = item.getField("extra") || "";
          extra = extra.replace(/^Citation Key:.*(\r?\n|$)/m, "").trim();
          if (value) extra = `Citation Key: ${value}${extra ? "\n" + extra : ""}`;
          item.setField("extra", extra);
          break;
        }
        case "title":
        case "shortTitle":
          item.setField(field, value);
          break;
        case "author": {
          const creators = item.getCreators();
          const hasSep = value.includes(",");
          const parts = value.split(",").map(s => s.trim());
          const updated = {
            lastName: parts[0] || "",
            firstName: hasSep ? (parts[1] || "") : "",
            fieldMode: hasSep ? 0 : 1,
          };
          if (creators.length > 0) {
            creators[0] = { ...creators[0], ...updated };
          } else {
            creators.push({ ...updated, creatorType: "author" });
          }
          item.setCreators(creators);
          break;
        }
        case "year":
        case "month": {
          const existing = item.getField("date") || "";
          const yr = field === "year" ? value : this._parseYear(existing);
          const mo = field === "month"
            ? this._normalizeMonth(value)
            : this._parseMonth(existing);
          const newDate = yr
            ? (mo ? `${yr}-${String(mo).padStart(2, "0")}` : yr)
            : "";
          item.setField("date", newDate);
          break;
        }
      }
      await item.saveTx();
    } catch (e) {
      Zotero.logError(`Zotero Audit: save failed (item=${itemID}, field=${field}): ${e}`);
      throw e;
    }
  },

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  _localizeType(typeName) {
    try { return Zotero.ItemTypes.getLocalizedString(typeName); } catch (e) { return typeName; }
  },

  _unlocalizeType(str) {
    try {
      for (const t of Zotero.ItemTypes.getTypes()) {
        try {
          if (Zotero.ItemTypes.getLocalizedString(t.name).toLowerCase() === str.toLowerCase()) return t.name;
        } catch (e) {}
      }
    } catch (e) {}
    return str;
  },

  _getCitationKey(item) {
    const extra = item.getField("extra") || "";
    const m = extra.match(/^Citation Key:\s*(.+)$/m);
    return m ? m[1].trim() : "";
  },

  _safeGetField(item, field) {
    try { return item.getField(field) || ""; } catch (e) { return ""; }
  },

  _formatCreator(c) {
    if (c.fieldMode === 1) return c.name || "";
    const parts = [c.lastName, c.firstName].filter(Boolean);
    return parts.length === 2 ? `${parts[0]}, ${parts[1]}` : parts[0] || "";
  },

  _parseYear(dateStr) {
    if (!dateStr) return "";
    const m = dateStr.match(/\b(\d{4})\b/);
    return m ? m[1] : "";
  },

  _parseMonth(dateStr) {
    if (!dateStr) return "";
    const iso = dateStr.match(/^\d{4}-(\d{2})/);
    if (iso) return iso[1];
    const map = {
      january:"01", february:"02", march:"03", april:"04", may:"05", june:"06",
      july:"07", august:"08", september:"09", october:"10", november:"11", december:"12",
      jan:"01", feb:"02", mar:"03", apr:"04", jun:"06",
      jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12",
    };
    const lower = dateStr.toLowerCase();
    for (const [name, num] of Object.entries(map)) {
      if (lower.includes(name)) return num;
    }
    return "";
  },

  _normalizeMonth(value) {
    if (!value) return "";
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1 && n <= 12) return String(n).padStart(2, "0");
    return this._parseMonth(value);
  },
};

function install() {}
function uninstall() {}
async function startup(data) { await ZoteroAudit.startup(data); }
function shutdown(data) { ZoteroAudit.shutdown(); }
function onMainWindowLoad(data) { ZoteroAudit.onMainWindowLoad(data); }
function onMainWindowUnload(data) { ZoteroAudit.onMainWindowUnload(data); }
