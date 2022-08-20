// import GSComponents from "../../../modules/base/GSComponents.mjs";
import GSUtil from "../../../modules/base/GSUtil.mjs";

class ColorsUI {

    static #table = null;
    static #modal = null;

    static {
        GSComponents.notifyFor('table-colors', ColorsUI.#init);
        GSComponents.notifyFor('modal-color', (el) => ColorsUI.#modal = el );
    }

    static #init(el, e) {
        ColorsUI.#table = el;
        el.listen('action', ColorsUI.#onAction);
    }

    static #onAction(e) {
        const action = e.detail.action;
        const fn = ColorsUI[action];
        if (GSUtil.isFunction(fn)) fn(e);
    }

    static clone(e) {
        
    }

    static export(e) {
        
    }

    static remove(e) {
        
    }

    static details(e) {
        ColorsUI.#modal.open();
    }
}
self.ColorsUI = ColorsUI;