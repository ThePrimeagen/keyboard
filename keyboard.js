/**
 * Created with PyCharm.
 * User: michaelpaulson
 * Date: 5/20/13
 * Time: 1:40 PM
 * To change this template use File | Settings | File Templates.
 */
define([
], function() {

    var keymap = {
        8: 'backspace',
        9: '\t',
        13: '\n',
        46: 'delete',
        48: '0',
        48: '1',
        48: '2',
        48: '3',
        48: '4',
        48: '5',
        48: '6',
        48: '7',
    };

    var modifiers = {
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'caps',
        27: 'esc',
        45: 'insert',
    };

    function _onKeyboardPress(code) {

    }

    class Keyboard {

        constructor() {

        }
    };

    return Keyboard;
});
