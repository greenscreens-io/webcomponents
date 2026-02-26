/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

export const AutocapitalizeTypes = ['', 'none', 'off', 'on', 'sentences', 'words', 'characters'];

export const autocapitalize = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && AutocapitalizeTypes.includes(newVal);
    }

};