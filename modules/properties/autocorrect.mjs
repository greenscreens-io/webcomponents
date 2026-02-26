/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

export const AutocorrectTypes = ['', 'on', 'off'];

export const autocorrect = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && AutocorrectTypes.includes(newVal);
    }

};