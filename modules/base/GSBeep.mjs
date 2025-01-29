/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSBeep class
 * @module base/GSBeep
 */


/**
 * A helper class to use browser AudiContext to make tones
 * @class
 */
export class GSBeep {

    static audioCtx = globalThis.AudioContext || globalThis.webkitAudioContext || globalThis.audioContext;

    /**
     * Helper function to emit a beep sound in the browser using the Web Audio API.
     * 
     * @param {number} duration - The duration of the beep sound in milliseconds.
     * @param {number} frequency - The frequency of the beep sound.
     * @param {number} volume - The volume of the beep sound.
     * @param {string} tyoe - The sound type (sine, square, sawtooth, triangle, custom)
     * 
     * @returns {Promise} - A promise that resolves when the beep sound is finished.
     */
    static beep(duration = 200, frequency = 440, volume = 1, type = 'sine') {
        return new Promise((resolve, reject) => {
            try{
                if (!GSBeep.isAvailable) return resolve();
                const context = new GSBeep.audioCtx();
                const oscillatorNode = context.createOscillator();
                const gainNode = context.createGain();
                oscillatorNode.connect(gainNode);

                // Set the oscillator frequency in hertz
                oscillatorNode.frequency.value = frequency;

                // Set the type of oscillator
                oscillatorNode.type = type;
                gainNode.connect(context.destination);

                // Set the gain to the volume
                gainNode.gain.value = volume * 0.01;

                // Start audio with the desired duration
                oscillatorNode.start(context.currentTime);
                oscillatorNode.stop(context.currentTime + duration * 0.001);

                // Resolve the promise when the sound is finished
                oscillatorNode.onended = () => resolve();                
            }catch(error) {
                reject(error);
            }
        });
    }

    static get isAvailable() {
        const {isActive, hasBeenActive } =  navigator.userActivation;
        return isActive || hasBeenActive;
    }
}
