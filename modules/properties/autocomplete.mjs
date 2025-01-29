/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export const AutocompleteTypes = ['', 'off', 'on'];

export const autocomplete = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && AutocompleteTypes.includes(newVal);
    }

};