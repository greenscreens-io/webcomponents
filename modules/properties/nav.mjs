/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

export const NavTypes = ['', 'pills', 'tabs', 'underline'];

export const nav = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && NavTypes.includes(newVal);
    }

};