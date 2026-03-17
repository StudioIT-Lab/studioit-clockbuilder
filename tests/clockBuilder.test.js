import assert from 'node:assert';
import { test, before } from 'node:test';
import studioitClockBuilder from '../src/studioitClockBuilder.js';

before(() => {
    global.ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    global.HTMLElement = class { };
});

test('ClockBuilder initialization', () => {
    const mockContainer = {
        appendChild: () => { },
        clientWidth: 100,
        clientHeight: 100,
        __proto__: HTMLElement.prototype
    };

    const clock = new studioitClockBuilder(mockContainer);

    assert.strictEqual(typeof clock.id, 'string', 'Clock should have a unique ID');
    assert.strictEqual(clock.jumping, 'none', 'Default motion style should be none');
});