/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

export const AutocompleteTypes = ['', 'off', 'on'];

export const autocomplete = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && AutocompleteTypes.includes(newVal);
    }

};