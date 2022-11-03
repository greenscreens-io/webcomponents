/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEnvironment class
 * @module base/GSEnvironment
 */

/**
 * A set of static functions used for detecting browser encironment
 * such as OS, orientation, browser type etc.
 * @class
 */
export default class GSEnvironment {

    /**
     * Check if page is inside mobile device
     * @returns {boolean}
     */
    static get isMobile() {
        if (navigator.userAgentData) return navigator.userAgentData.mobile;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /** 
     * Check if page is inside desktop
     * @returns {boolean}
     */
    static get isDesktop() {
        return !GSEnvironment.isMobile;
    }

    static get isWebkit() {
        return /webkit/.test(navigator.userAgent.toLowerCase());
    }

    /**
     * Check if value match current URL scheme
     * @param {*} val 
     */  
    static isValidProtocol(val = '') {
        if (!val) return true;
        return location.protocol.slice(0, -1) === val;
	}

    /**
     * Check if value match current browser type
     * @param {string} val 
     * @returns {boolean}
     */
    static isValidBrowser(val = '') {
        if (!val) return true;
        const strVal = val.toLowerCase();
        if (navigator.userAgentData) {
            let sts = false;
            navigator.userAgentData.brands.forEach((v) => {
                if (v.brand.toLowerCase().includes(strVal)) {
                    sts = true;
                }
            });
            return sts;
        }
        const strAgt = navigator.userAgent.toLocaleLowerCase();
        const isEdge = strAgt.indexOf('edg') > 0;
        if (isEdge && strVal.startsWith('edg')) return true;
        return !isEdge && strAgt.indexOf(strVal) > 0;
    }

    /**
     * Returns if environment matched
     * dektop, mobile, tablet, android, linux, winwdows, macos
     * @returns {boolean}
     */
    static isValidEnvironment(val = '') {

        if (!val) return true

        if (val === 'desktop') {
            return GSEnvironment.isDesktop;
        }

        if (val === 'mobile') {
            return GSEnvironment.isMobile;
        }

        return GSEnvironment.isDevice(val);
    }

    /**
     * Returns true if device /os is valid
     * @param {string} val 
     * @returns {boolean}
     */
    static isDevice(val = '') {
        if (!val) return true;
        const strVal = val.toLowerCase();

        if (navigator.userAgentData && navigator.userAgentData.platform) {
            const platform = navigator.userAgentData.platform.toLowerCase();
            return platform === strVal;
        }

        const strAgt = navigator.userAgent.toLocaleLowerCase();
        return strAgt.indexOf(strVal) > 1;
    }

    /**
     * Returns if orientation matched
     * horizontal, vertical, portrait, landscape
     * retuns true if value not set
     * 
     * @param {string} val
     * @returns {boolean}
     */
    static isValidOrientation(val = '') {

        if (!val) return true;

        if (!screen.orientation) return true;

        const otype = screen.orientation.type;

        if (otype.includes('portrait')) {
            return val === 'portrait' || val === 'vertical';
        }

        if (otype.includes('landscape')) {
            return val === 'landscape' || val === 'horizontal';
        }

        return true;
    }

    static {
        Object.seal(GSEnvironment);
    }
}
