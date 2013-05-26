var mpKeyboard = (function() {

    /**
     * @type {string}
     */
    var SHIFT = 'shift';

    /**
     * This key is current supported in all sorts of goofy ways.  So this must
     * be done different than the rest.
     * @type {string}
     */
    var COMMAND = 'cmd';

    /**
     * @type {string}
     */
    var CTRL = 'ctrl';

    /**
     * @type {string}
     */
    var ALT = 'alt';

    /**
     * @type {string}
     */
    var CAPS_LOCK = 'caps';

    /**
     * @type {string}
     */
    var ESCAPE = 'esc';

    /**
     * @type {string}
     */
    var INSERT = 'insert';

    /**
     * The set of available modifiers.  Used for searching.
     * @type {Array}
     */
    var AVAILABLE_MODIFIERS = [SHIFT, COMMAND, CTRL, ALT, CAPS_LOCK, ESCAPE, INSERT];

    /**
     * The list of modifier keys.
     * @type {{16: string, 17: string, 18: string, 20: string,
     *         27: string, 45: string}}
     */
    var MODIFIERS = {
        16: SHIFT,
        17: CTRL,
        18: ALT,
        20: CAPS_LOCK,
        27: ESCAPE,
        45: INSERT,
        91: COMMAND, // WebKit: Left Apple
        93: COMMAND, // WebKit: Right Apple
        224: COMMAND // FireFox: Apple
    };

    /**
     * The range for digits.  Inclusive (48) Exclusive (58)
     * @type {Array}
     */
    var DIGIT_RANGE = [48, 58];

    /**
     * The set of available digits.
     * @type {string}
     */
    var DIGITS = '0123456789!@#$%^&*()';

    /**
     * The set of alphabet characters.
     * @type {string}
     */
    var ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    /**
     * The range for alphabets.  Inclusive 65, Exclusive 91
     * @type {Array}
     */
    var ALPHABET_RANGE = [65, 91];

    /**
     * Some basic keycodes that are not alphanumeric.
     * @type {{8: string, 9: string, 13: string, 46: string}}
     */
    var OTHER_KEYS = {
        8: 'backspace',
            9: '\t',
            13: '\n',
            46: 'delete'
    };

    /**
     * If array contains the value provided.  It is type checked as well.
     * @param {Array} arr
     * @param {number} value
     * @returns {boolean}
     */
    function arrayContains(arr, value) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === value) {
                return true;
            }
        }
        return false;
    }

    /**
     * Removes the first found version from the array.
     * @param {Array} arr
     * @param {*} value
     */
    function arrayRemove(arr, value) {
        for (var i = 0, len = arr.length; i < len; i++) {
           if (arr[i] === value) {
               arr.splice(i, 1);
               break;
           }
        }
    }

    /**
     * Configures a new keyboard
     * @param {{
     *      onPress: Function,
     *      host: HTMLElement,
     *      onRelease: boolean
     * }} configuration
     * @constructor
     */
    var Keyboard = function(configuration) {
        /**
         * @type {Array}
         */
        this.modifiers = [];
        /**
         * @type {Function}
         * @private
         */
        this._onPress = configuration.onPress;

        /**
         * If the key is being released, send to the end user what key is release
         * and what modifiers were currently being pressed during that time.
         * @type {boolean}
         * @private
         */
        this._onRelease = configuration.onRelease || false;

        /**
         * @type {HTMLElement}
         * @private
         */
        this._host = configuration.host;

        this._initialize();
    };

    Keyboard.prototype = {

        /**
         * On keyup and down are bound here.
         * @private
         */
        _initialize: function() {

            this._host.onkeydown = this._onKeydown.bind(this);
            this._host.onkeyup = this._onKeyup.bind(this);
        },

        /**
         * Removes the bound keys.
         */
        dispose: function() {

            this._host.onkeydown = null;
            this._host.onkeyup = null;
        },

        /**
         * On key down.
         * @param {KeyboardEvent} keyboardEvent
         * @private
         */
        _onKeydown: function(keyboardEvent) {

            var code = keyboardEvent.keyCode;
            var keyStr = this._keycodeToString(code);

            if (this._isModifier(code)) {
                if (!this._isModifierActive(keyStr)) {
                    this.modifiers.push(keyStr);
                }
                keyStr = '';
            }
            this._onPress.apply(null, [this._keyResponse(keyStr)]);
        },

        /**
         * on key up.
         * @param {KeyboardEvent} keyboardEvent
         * @private
         */
        _onKeyup: function(keyboardEvent) {
            var code = keyboardEvent.keyCode;
            var keyStr = this._keycodeToString(code);

            if (this._isModifier(code)) {
                if (this._isModifierActive(keyStr)) {
                    arrayRemove(this.modifiers, keyStr);
                }
                keyStr = '';
            }

            if (this._onRelease) {
                this._onRelease.apply(null, [this._keyResponse(keyStr)]);
            }
        },

        /**
         * The key response is generated from incoming key presses.
         * @param {string} keyString
         * @returns {{keyString: string, modifiers: Array}}
         * @private
         */
        _keyResponse: function(keyString) {

            // If the response is a modifier.
            return {
                keyString: keyString,
                modifiers: this.modifiers
            };
        },

        /**
         * The keyboard to string takes in a keyboard code and transforms it into
         * a string.
         *
         * NOTE: Instead of using a map for all codes i have decided to go with
         * some mapping.  The problem comes to the symbols and capital letters.
         * Though this adds more complexity to searching for keycode, it also makes
         * things simple when doing modifier keys.
         *
         * @param {number} code
         * @returns {string}
         * @private
         */
        _keycodeToString: function(code) {

            if (this._isModifier(code)) {
                return MODIFIERS[code];
            } else if (this._isAlphabet(code)) {

                // NOTE: Offsets the code by the alphabet starting range.  If the shift key is
                // active then an additional 26 is added to the offset for the caps version.
                var offset = code - ALPHABET_RANGE[0];
                if (this._isModifierActive(SHIFT)) {
                    offset += 26;
                }

                return ALPHABET[offset];
            } else if (this._isDigit(code)) {

                // NOTE: see note above
                var offset = code - DIGIT_RANGE[0];
                if (this._isModifierActive(SHIFT)) {
                    offset += 10;
                }

                return DIGITS[offset];
            }

            return OTHER_KEYS[code];
        },

        /**
         * Checks to see if the string provided is an active modifier.
         * @param {string} str
         * @boolean {boolean}
         * @private
         */
        _isModifierActive: function(str) {
            return arrayContains(this.modifiers, str);
        },

        /**
         * checks to see if this is a modifier or not.
         *
         * @param {number} code
         * @returns {string|boolean}
         * @private
         */
        _isModifier: function(code) {
            return MODIFIERS[code] !== undefined;
        },

        /**
         * Checks to see if the code is within the alphabet range.
         * @param {number} code
         * @returns {boolean}
         * @private
         */
        _isAlphabet: function(code) {
            return code >= ALPHABET_RANGE[0] && code < ALPHABET_RANGE[1];
        },

        /**
         * Checks to see if the code is within the digit range.
         * @param {number} code
         * @returns {boolean}
         * @private
         */
        _isDigit: function(code) {
            return code >= DIGIT_RANGE[0] && code < DIGIT_RANGE[1];
        }
    };

    return Keyboard;
}());
