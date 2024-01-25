/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

export const SizeTypes = { 'default' : '', 'normal': '',  'medium': '', 'small': 'sm', 'large': 'lg', 'big' : 'lg' };

export const size = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && Object.hasOwn(SizeTypes, newVal);
    }

};