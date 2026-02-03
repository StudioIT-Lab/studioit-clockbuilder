class studioitClockBuilder {
    static #clockInstances = {};
    static #clockStore = {};
    static #clocksRunning = false;
    #lastUpdate = 0;
    #resizeObserver = new ResizeObserver(() => this.#updateSize());

    /**
    * Creates a new clock instance inside the given container.
    * @param {HTMLElement} container - The container element for the clock.
    * @throws {Error} If container is missing.
    */
    constructor(container) {
        if (!container) throw new Error("Clock requires a container element");
        this.fps = 80;
        this.jumping = 'none';
        this.container = container;
        this.clockStyle = 'default';
        this.#generateIdentifier();

        /** used for the impulse motion style */
        this.#generateImpulseCycle();

        this.#resizeObserver.observe(this.container);

        return this;

    }

    /**
     * Sets the motion style of the clock.
     * @param {'none'|'jumping'|'smooth'|'impulse'} style - The motion style.
     * @returns {studioitClockBuilder} The current clock instance (for chaining).
     */
    motionStyle(style) {
        this.jumping = style;
        return this;
    }

    /**
     * Sets the frames-per-second for the update loop.
     * @param {number} fps - Frames per second.
     * @returns {studioitClockBuilder} The current clock instance (for chaining).
     */
    setFps(fps) {
        this.fps = fps;
        return this;
    }

    /**
     * Returns the unique identifier of this clock instance.
     * @returns {string} Clock ID.
     */
    getId() {
        return this.id;
    }

    /**
     * Stores a clock style with its parts as base64 images.
     * @param {string} identifier - Unique name for the clock style.
     * @param {Object.<string, string>} images - Clock part images (URL, SVG string, or relative path).
     * @throws {Error} If identifier or images are missing, or the style already exists.
     *
     * Clock parts that can be stored:
     * @property {string} face - Clock face image.
     * @property {string} hourHand - Hour hand image.
     * @property {string} minuteHand - Minute hand image.
     * @property {string} secondHand - Second hand image.
     */
    static async storeClockStyle(identifier, images) {
        if (!identifier) throw new Error("Clock style identifier missing");
        if (!images) throw new Error("Clock style images missing");
        if (studioitClockBuilder.#clockStore[identifier])
            throw new Error("Clock style already defined");

        studioitClockBuilder.#clockStore[identifier] = {};

        for (const [key, value] of Object.entries(images)) {
            let dataUrl;

            /* If it's a URL (absolute) */
            if (studioitClockBuilder.#isUrl(value)) {
                const response = await fetch(value);
                if (!response.ok) throw new Error(`Failed to fetch image: ${value}`);
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                dataUrl = `data:${blob.type};base64,${base64}`;
            }
            /* If it's a string containing an SVG XML */
            else if (typeof value === 'string' && value.trim().startsWith('<svg')) {
                /* Convert user-provided SVG string to a safe Base64 data URL */
                const blob = new Blob([value], { type: 'image/svg+xml' });
                dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }
            /* Otherwise assume it's a relative path (fetchable) */
            else {
                try {
                    const response = await fetch(value);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${value}`);
                    const blob = await response.blob();
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    dataUrl = `data:${blob.type};base64,${base64}`;
                } catch (err) {
                    throw new Error(`Invalid image source for ${key}: ${err.message}`);
                }
            }

            studioitClockBuilder.#clockStore[identifier][key] = dataUrl;
        }

    }

    /**
    * Selects a previously stored clock style.
    * @param {string} identifier - Identifier of the clock style.
    * @returns {studioitClockBuilder} The current clock instance (for chaining).
    * @throws {Error} If the style does not exist.
    */
    setClockStyle(identifier) {
        if (!studioitClockBuilder.#clockStore[identifier]) throw new Error("Invalid clock style");
        this.clockStyle = identifier;
        return this;
    }

    /**
    * Generates and appends the clock's HTML elements to its container.
    * @returns {studioitClockBuilder} The current clock instance (for chaining).
    * @throws {Error} If no clock style has been defined.
    */
    show() {
        if (!this.clockStyle) throw new Error("No clock style defined"); /** clock style needs to be defined first */
        this.wrapper?.remove();
        this.wrapper = document.createElement('div');
        this.wrapper.id = this.id;
        const size = this.#getMinContainerSize();
        const wrapperStyles = {
            width: `${size}px`,
            height: `${size}px`,
            display: 'block',
            position: 'relative',
            margin: '0',
            padding: '0',
            overflow: 'hidden',
            boxSizing: 'border-box',
            border: 'none',
        };
        const componentStyles = {
            width: `100%`,
            height: `100%`,
            display: 'block',
            position: 'absolute',
            padding: '0',
            top: '0',
            left: '0',
            border: 'none',
            pointerEvents: 'none',
            transformOrigin: 'center'

        };


        Object.assign(this.wrapper.style, wrapperStyles); /** assign classes to wrapper */

        const clockElements = {};

        Object.assign(clockElements, studioitClockBuilder.#clockStore[this.clockStyle]); /** get base64 strings */
        console.log(studioitClockBuilder.#clockStore[this.clockStyle]);
        console.log(clockElements);

        /** generate the individual clock elements and assign classes */
        for (const [key, value] of Object.entries(clockElements)) {
            const clockComponent = document.createElement('img');
            Object.assign(clockComponent.style, componentStyles);
            clockComponent.src = clockElements[key] || '';
            clockComponent.setAttribute('alt', this.id);
            clockComponent.id = `${this.id}-${key}`;
            this[key] = clockComponent;
            this.wrapper.appendChild(clockComponent);
        }

        this.container.appendChild(this.wrapper);




        return this;
    }

    /**
     * Starts the clock's update loop.
     * @returns {studioitClockBuilder} The current clock instance (for chaining).
     */
    start() {
        if (!studioitClockBuilder.#clocksRunning) {
            studioitClockBuilder.#clocksRunning = true;
            studioitClockBuilder.#runClocks();
        }
        /** allow update loop to run */
        studioitClockBuilder.#clockInstances[this.id].running = true;
        return this;
    }

    /**
     * Stops the clock's update loop.
     * @returns {studioitClockBuilder} The current clock instance (for chaining).
     */
    stop() {
        studioitClockBuilder.#clockInstances[this.id].running = false;
        let anyRunning = false;
        for (const [key, value] of Object.entries(studioitClockBuilder.#clockInstances)) {
            if (studioitClockBuilder.#clockInstances[key].running) anyRunning = true;
        }
        /** block update loop if no clock is running anymore */
        studioitClockBuilder.#clocksRunning = false;
        return this;
    }

    static #isUrl(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }


    /*********** PRVATE METHODS ***********/

    #getMinContainerSize() {
        return Math.min(this.container.clientWidth, this.container.clientHeight);
    }

    #updateSize() {
        const size = this.#getMinContainerSize();
        const wrapperStyles = {
            width: `${size}px`,
            height: `${size}px`,
        };
        Object.assign(this.wrapper.style, wrapperStyles);
    }


    /** generates a unique identifier and stores its info in a shard object */
    #generateIdentifier() {
        do {
            const rand = Math.floor(Math.random() * 900000) + 100000;
            this.id = `studioitClockBuilder${rand}`;
        }
        while (studioitClockBuilder.#clockInstances[this.id]);
        studioitClockBuilder.#clockInstances[this.id] = { running: false, instance: this };
    }

    #generateImpulseCycle() {
        this.impulseCycle = Math.random() * (58.7 - 57.5) + 57.5;
    }





    /** defines the update loop and takes the running state of each clock into consideration */
    static #runClocks(now = performance.now()) {
        for (const [id, data] of Object.entries(studioitClockBuilder.#clockInstances)) {
            if (!data.running) continue;
            data.instance.#updateClockHands(now);
        }
        if (studioitClockBuilder.#clocksRunning) requestAnimationFrame(studioitClockBuilder.#runClocks);
    }

    /** used to respect the fps setting */
    #shouldUpdate(now) {
        const interval = 1000 / this.fps; // ms per frame
        if (now - this.#lastUpdate >= interval) {
            this.#lastUpdate = now;
            return true;
        }
        return false;
    }

    /** updates the clockhands */
    #updateClockHands(now) {
        /** checks if an update based on the fps settings is due */
        if (!this.#shouldUpdate(now)) return;

        /** get current time with ms for smooth movements */
        const time = new Date();
        const sec = time.getSeconds() + time.getMilliseconds() / 1000;
        const min = time.getMinutes() + sec / 60;
        const hour = time.getHours() + min / 60;

        /** the minute hand updates each second, the minute and hour hand update each minute */
        if (this.jumping === 'jumping') {
            const secInt = Math.floor(sec);
            const minInt = Math.floor(min);
            const hourInt = Math.floor(hour % 12);

            const hourDeg = hourInt * 30 + minInt / 60 * 30;

            if (this.hourHand) this.hourHand.style.transform = `rotate(${hourDeg}deg)`;   // 360/12 = 30
            if (this.minuteHand) this.minuteHand.style.transform = `rotate(${minInt * 6}deg)`; // 360/60 = 6
            if (this.secondHand) this.secondHand.style.transform = `rotate(${secInt * 6}deg)`; // 360/60 = 6
        }

        /** the minute hand updates according to the fps, the minute and hour hand update each minute */
        else if (this.jumping === 'smooth') {
            const minInt = Math.floor(min);
            const hourInt = Math.floor(hour % 12);

            const hourDeg = hourInt * 30 + minInt / 60 * 30;

            if (this.hourHand) this.hourHand.style.transform = `rotate(${hourDeg}deg)`; // 360/12 = 30
            if (this.minuteHand) this.minuteHand.style.transform = `rotate(${minInt * 6}deg)`; // 360/60 = 6
            if (this.secondHand) this.secondHand.style.transform = `rotate(${sec * 6}deg)`; // 360/60 = 6
        }
        /** this behaviour emulates a master-slave clock system.
         * the second hand runs a bit faster, pauses at the top until it is released for the new minute again
        */
        else if (this.jumping === 'impulse') {
            const cycleDuration = this.impulseCycle; /* seconds for cycle */
            const pauseDuration = 60 - this.impulseCycle;  /* pause */

            const secFloat = time.getSeconds() + time.getMilliseconds() / 1000;
            const secCycle = secFloat % 60;

            /* state tracking */
            if (!this._daughterCycle) this._daughterCycle = { jumped: false, jiggleStart: 0 };

            let secondDeg;
            let minuteDeg;
            let hourDeg;

            const minInt = time.getMinutes();
            const hourInt = time.getHours() % 12;

            if (secCycle <= cycleDuration) {
                secondDeg = (secCycle / cycleDuration) * 360;

                if (!this._daughterCycle.jumped) {
                    /** Jump minute and hour once at end of previous pause */
                    minuteDeg = minInt * 6;
                    hourDeg = hourInt * 30 + (minInt / 60) * 30;
                    this._daughterCycle.jumped = true;
                    this._daughterCycle.jiggleStart = performance.now();
                } else {
                    /** Jiggle hands after jump */
                    const elapsed = performance.now() - this._daughterCycle.jiggleStart;

                    const initialAmplitude = 8;
                    const decayRate = 2;

                    /** decay */
                    const jiggleAmplitude = initialAmplitude * Math.pow(0.4, elapsed / 350);

                    const jiggle = Math.sin(elapsed / 40) * jiggleAmplitude;

                    minuteDeg = minInt * 6 + jiggle;
                    hourDeg = hourInt * 30 + (minInt / 60) * 30 + jiggle / 12;
                }
            } else {
                /** Pause phase */
                secondDeg = 0;
                /** keep minutes and hours in position */
                minuteDeg = minInt * 6;
                hourDeg = hourInt * 30 + (minInt / 60) * 30;

                /** reset jump animation */
                this._daughterCycle.jumped = false;
            }

            if (this.secondHand) this.secondHand.style.transform = `rotate(${secondDeg}deg)`;
            if (this.minuteHand) this.minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
            if (this.hourHand) this.hourHand.style.transform = `rotate(${hourDeg}deg)`;
        }

        /** default value, all hands rotate smoothly, according to the fps */
        else {
            /** Rotate hand images */
            if (this.hourHand) this.hourHand.style.transform = `rotate(${hour * 30}deg)`;
            if (this.minuteHand) this.minuteHand.style.transform = `rotate(${min * 6}deg)`;
            if (this.secondHand) this.secondHand.style.transform = `rotate(${sec * 6}deg)`;
        }

    }
}


export default studioitClockBuilder;