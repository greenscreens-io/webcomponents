/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export const EnvironmentTypes = ['', 'desktop', 'mobile', 'tablet', 'android', 'linux', 'windows', 'macos', 'ios'];

export const environment = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && EnvironmentTypes.includes(newVal);
    }

};