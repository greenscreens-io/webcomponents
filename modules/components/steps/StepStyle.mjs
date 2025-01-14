/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { GSCacheStyles } from "../../base/GSCacheStyles.mjs";

/**
 * A module loading GSStepStyle class
 * @module components/steps/GSStepStyle
 */
export class GSStepStyle {

    static {
        GSCacheStyles.adopt(GSStepStyle.style);
    }

    static get style() {
        return `
        .step .step-icon-wrap {
            height: 80px;
        }
        
        .step .step-icon-wrap::before,
        .step .step-icon-wrap::after {
            display: block;
            position: absolute;
            top: 50%;
            width: 50%;
            height: 3px;
            margin-top: -1px;
            background-color: var(--bs-gray-200);
            content: '';
            z-index: 1
        }
        
        .step .step-icon-wrap::before {
            left: 0
        }
        
        .step .step-icon-wrap::after {
            right: 0
        }
        
        .step .step-icon {
            width: 80px;
            height: 80px;
            line-height: 81px;
            z-index: 5
        }
                
        .step:first-child .step-icon-wrap::before {
            display: none
        }
        
        .step:last-child .step-icon-wrap::after {
            display: none
        }
                
        @media (max-width: 576px) {
            .flex-sm-nowrap .step .step-icon-wrap::before,
            .flex-sm-nowrap .step .step-icon-wrap::after {
                display: none
            }
        }
        
        @media (max-width: 768px) {
            .flex-md-nowrap .step .step-icon-wrap::before,
            .flex-md-nowrap .step .step-icon-wrap::after {
                display: none
            }
        }
        
        @media (max-width: 991px) {
            .flex-lg-nowrap .step .step-icon-wrap::before,
            .flex-lg-nowrap .step .step-icon-wrap::after {
                display: none
            }
        }
        
        @media (max-width: 1200px) {
            .flex-xl-nowrap .step .step-icon-wrap::before,
            .flex-xl-nowrap .step .step-icon-wrap::after {
                display: none
            }
        }        
        `;
    }
}