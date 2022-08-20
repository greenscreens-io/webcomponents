import GSComponents from "../../../modules/base/GSComponents.mjs";
import GSUtil from "../../../modules/base/GSUtil.mjs";

class SettingsUI {

    static #table = null;
    static #modal = null;

    static {
        GSComponents.notifyFor('table-settings', SettingsUI.#init);
    }

    static #init(el, e) {
        SettingsUI.#table = el;
        el.listen('action', SettingsUI.#onAction);
    }

    static #onAction(e) {
        const action = e.detail.action;
        const fn = SettingsUI[action];
        if (GSUtil.isFunction(fn)) fn(e);
    }

    static clone(e) {
        
    }

    static export(e) {
        
    }

    static remove(e) {
        
    }

    static details(e) {
        
    }
}
self.SettingsUI = SettingsUI;