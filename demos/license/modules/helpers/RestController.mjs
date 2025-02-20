/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/*
 * Class handling REST API license service
 */
export class RestController {

    /**
     * Status if admin session is available
     */
    static #available = false;

    /**
     * Login to admin session
     * @param {*} data 
     */
    static async login(data) {
        // TODO call remote service
        this.#available = true;
        return this.#available;
    }

    /**
     * Logout active session
     */    
    static async logout() {
        // TODO call remote service
        this.#available = false;
        return this.#available;
    }

    /**
    * Create new license by IBM i system serial
    * @param {*} data 
    */
    static async createLicense(data) {

    }

    /**
     * Update active license by IBM i system serial
     * @param {*} data 
     */
    static async updateLicense(data) {

    }

    /**
     * Get history records fitlered by license
     * @param {*} data 
     */
    static async history(data) {

    }
}