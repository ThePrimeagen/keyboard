var keyboard = new mpKeyboard({
    host: document,
    onEventCallback: log
});

function log(out) {
    console.log(JSON.stringify(out));
}
