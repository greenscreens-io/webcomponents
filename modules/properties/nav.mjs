/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

export const NavTypes = ['', 'pills', 'tabs', 'underline'];

export const nav = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && NavTypes.includes(newVal);
    }

};