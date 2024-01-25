/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

export const EnvironmentTypes = ['', 'dektop', 'mobile', 'tablet', 'android', 'linux', 'windows', 'macos', 'ios'];

export const environment = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && EnvironmentTypes.includes(newVal);
    }

};