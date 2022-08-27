import GSElement from "../../../modules/base/GSElement.mjs";
import GSEvent from "../../../modules/base/GSEvent.mjs";
import GSAttr from "../../../modules/base/GSAttr.mjs";

class GSSidebar extends GSElement {

	get template() {
		return GSAttr.get(this, 'template', '//sidebar_narrow.html');
	}

	get minWidth() {
		return GSAttr.get(this, 'minWidth', '64');
	}

	get maxWidth() {
		return GSAttr.get(this, 'maxWidth', '280');
	}

	get auto() {
		return GSAttr.getAsBool(this, 'auto', 'true');
	}

	onReady() {
		const me = this;
		const el = me.topEl;
		el.style.width = me.maxWidth;

		me.attachEvent(el, 'click', me.onSelect.bind(me));

		if (!me.auto) return;
		me.attachEvent(el, 'mouseover', me.onFocus.bind(me));
		me.attachEvent(el, 'mouseout', me.onUnfocus.bind(me));

		el.style.width = me.minWidth;
	}

	onSelect(e) {
		const el = e.target.closest('a[data-view]');
		if (!el) return;
		GSEvent.send(this, 'gs-evt-view', el.getAttribute('data-view'));
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
		return this.query('div');
	}

	static {
		customElements.define('gs-sidebar', GSSidebar);
		Object.seal(GSSidebar);
	}
}


