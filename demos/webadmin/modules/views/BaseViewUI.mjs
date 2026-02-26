/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */

import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
import { GSElement } from '../../../../modules/GSElement.mjs';

import { Utils } from "../utils/Utils.mjs";

/**
 * A module loading BaseUI class
 * @module BaseUI
 */

/**
 * BaseUI handles basic screen data view (used by other UI elements)
 * @class
 * @extends {GSElement}
 */
export class BaseViewUI extends GSElement {

	constructor() {
		super();
		this.className = 'd-flex flex-fill';
	}

	firstUpdated(changed) {
		super.firstUpdated(changed);

		const me = this;
		GSEvents.monitorAction(me, 'view');

		requestAnimationFrame(async () => {
			if (!me.table) return;
			await GSUtil.timeout(100);
			me.onViewRefresh();
		});
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	/**
	 * Record key field
	 */
	get recID() {
		return 'id';
	}

	/**
	 * Table data filter
	 */
	get filterSimple() {
		const flt = this.filter || [];
		const obj = {};
		flt.forEach(o => obj[o.name] = o.value);
		return obj;
	}

	get table() {
		return this.query('#table-main', true, true);
	}

	/**
	 * Record popup
	 */
	get modal() {
		return this.query('#modal-main', true, true);
	}

	/**
	 * Table data store
	 */
	get store() {
		return this.table?.dataController?.store;
	}

	get filter() {
		return this.store?.filter;
	}

	get sort() {
		return this.store?.sort;
	}

	get form() {
		return this.modal?.form;
	}

    get waiter() {
        return Utils.waiter;
    }

	/**
	 * Export table data
	 */
	async onViewExport() {
		const me = this;
		const name = me.tagName.toLowerCase();
		const data = me.store.data;
		GSUtil.export([JSON.stringify(data)], `${name}.json`);
	}

	/**
	 * Table record action - clone record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewClone(e) {

		const me = this;
		const data = me.store.selected.pop();
		if (!data) return;

		const rec = Object.assign({}, data);

		try {

			const sts = await me.onClone(rec);
			if (!sts) throw new Error('Record not cloned!');

			if (DEMO) {
				// update locally to refresh ui
				const cloned = Object.assign({}, rec);
				// remove record internal symbols (selected)
				Object.getOwnPropertySymbols(cloned).forEach(s => delete cloned[s]);
				// remove record key field
				delete cloned[me.store.key];
				me.store.append(cloned, true);
			}
			await me.onViewRefresh();
			Utils.notify.secondary('', 'Record cloned!', false, 2, 0);
		} catch (e) {
			me.onError(e);
		}

	}

	/**
	 * Table record action - remove record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewRemove(e) {

		const me = this;
		const data = me.store.selected.pop();
		if (!data) return;

		try {

			const sts = await me.onRemove(data);
			if (!sts) throw new Error('Record not removed!');

			me.store.remove(data);
			Utils.notify.danger('', 'Record removed!', false, 2, 0);

		} catch (e) {
			me.onError(e);
		}

	}

	/**
	 * Table record action - edit data
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewDetails(e) {

		const me = this;
		let data = me.store.selected.pop();
		data = await me.onDetails(data);
		if (!data) return;

		let sts = false;
		const modal = me.modal;
		modal.open(data);
		const result = await modal.waitEvent('confirmed');
		
		try {
			me.waiter.open();
			sts = await me.onUpdate(result.detail);
			if (!sts) throw new Error('Record not updated!');
			// update locally to refresh ui
			Object.assign(data, result.detail);
		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
			//modal.enable();
			if (sts) {
				modal.reset();
				await modal.close();
			}
		}

		if (sts) {		
			Utils.notify.warn('', 'Record updated!', false, 2, 0);
			await me.store.read();
			await me.onViewRefresh();
		} else {
			me.onViewDetails(e);
		}
	}

	/**
	 * Toolbar table action - create record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewCreate(e) {

		let sts = false;
		const me = this;
		const modal = me.modal;

		modal.open();
		const result = await modal.waitEvent('confirmed');

		try {
			me.waiter.open();
			sts = await me.onCreate(result.detail);
			if (!sts) throw new Error('Record not created!');

		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
			//modal.enable();
			if (sts) {		
				modal.reset();
				await modal.close();		
			}
		}

		if (sts) {		
			Utils.notify.warn('', 'Record created!', false, 2, 0);
			await me.store.read();
			await me.onViewRefresh();
		} else {
			me.onViewCreate(e);
		}
	}

	/**
	 * Toolbar table action - refresh data
	 * @param {Event} e 
	 */
	async onViewRefresh(e = {}) {
		// get data from extension and populate table;
		const me = this;

		if (!me.store) return;
		const data = await me.onLoad(e);

		try {
			me.waiter.open();
			if (Array.isArray(data) && data.length > 0) {
				me.store.setData(data);
				// me.store.firstPage();
			} else {
				await me.store.read();
			}
			if (e === true) me.table.resize();
            if (e?.detail === 'refresh') Utils.notify.info('', 'Data refreshed!', false, 2, 0);
		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
		}

	}

	/**
	 * Toolbar table action - filter records
	 * @param {Event} val 
	 */
	onViewSearch(e) {
		const me = this;
		me.store.filter = e.detail.value;
		me.store.fields = me.table.columns;
		me.store.read(me);
	}

	/**
	 * Handle data before opening the modal form
	 * @param {*} data 
	 * @returns 
	 */
	async onDetails(data) {
		return data;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle new record received from popup form.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onCreate(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle new record cloned from existing one.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onClone(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle existing record change received from popup form.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onUpdate(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle record removal received from table context menu option - remove.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onRemove(data) {
		return true;
	}

	/**
	 * Called to load view data
	 * @returns {Array<Object>}
	 * @throws {Error}
	 */
	async onLoad(e) {
		return false;
	}

	onError(e) {
		Utils.handleError(e);
	}
}
