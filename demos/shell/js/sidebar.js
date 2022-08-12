import GSElement from "/modules/base/GSElement.mjs";
import GSUtil from "/modules/base/GSUtil.mjs";

import * as helpers from "./helpers.js";

class GSSidebar extends GSElement {

	get template() {
		return GSUtil.getAttribute(this, 'template', '//sidebar_narrow.html');
	}

	get minWidth() {
		return GSUtil.getAttribute(this, 'minWidth', '64');
	}

	get maxWidth() {
		return GSUtil.getAttribute(this, 'maxWidth', '280');
	}

	get auto() {
		return GSUtil.getAttributeAsBool(this, 'auto', 'true');
	}

	onReady() {
		const me = this;
		const el = me.topEl;
		el.style.width = me.maxWidth;

		me.attachEvent(el, 'click', me.onSelect.bind(me));
		helpers.attachTooltips(el);
		if (!me.auto) return;
		me.attachEvent(el, 'mouseover', me.onFocus.bind(me));
		me.attachEvent(el, 'mouseout', me.onUnfocus.bind(me));

		el.style.width = me.minWidth;
	}

	onSelect(e) {
		const el = e.target.closest('a[data-view]');
		if (!el) return;
		GSUtil.sendEvent(this, 'gs-evt-view', el.getAttribute('data-view'));
		this.onUnfocus(e);
	}

	onFocus(e) {
		const me = this;
		const el = me.topEl;
		el.style.width = me.maxWidth;
	}

	onUnfocus(e) {
		const me = this;
		const el = me.topEl;
		el.style.width = me.minWidth;
	}

	get topEl() {
		return this.findEl('div');
	}
}

customElements.define('gs-sidebar', GSSidebar);
