/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

class GSSidebar extends GSElement {

	static properties = {
		auto: { type: Boolean },
		minWidth: { type: Number, attribute: 'min-width' },
		maxWidth: { type: Number, attribute: 'max-width' },
	};

	constructor() {
		super();
		this.minWidth = 64;
		this.maxWidth = 280;
		this.template = '//sidebar_narrow.html';
	}

	renderUI() {
        return this.renderTemplate();
    }

	templateInjected() {

		const me = this;
		const el = me.topEl;

		if (!el) return;

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
		this.emit('gs-evt-view', el.dataset.view);
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
		return this.query('div', true);
	}

	static {
		GSElement.define('gs-sidebar', GSSidebar);
	}
}


