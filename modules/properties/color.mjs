/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

export const ColorTypes = ['', 'primary', 'secondary', 'dark', 'light', 'info', 'warning', 'danger', 'alert', 'link', 'success'];

export const color = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && ColorTypes.includes(newVal);
    }

};