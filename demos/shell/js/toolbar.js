/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

class GSToolbar extends GSElement {

	constructor() {
		super();
		this.template = '//toolbar.html';
	}	

	get topEl() {
		return this.query('div', true);
	}

    renderUI() {
        return this.renderTemplate();
    }
	
	templateInjected() {
		const me = this;
		const el = me.topEl;
		me.attachEvent(el, 'click', me.onSelect.bind(me));
	}

	onSelect(e) {
		const el = e.target.closest('a[data-view]');
		if (!el) return;
		this.emit('gs-evt-view', el.dataset.view);
	}

	static {
		GSElement.define('gs-toolbar', GSToolbar);
	}
}


