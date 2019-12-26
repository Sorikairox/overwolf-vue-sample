let _listeners = [];

function addListener(eventHandler) {
    _listeners.push(eventHandler);
}

function trigger(eventName, data) {
    for (let listener of _listeners) {
        listener(eventName, data);
    }
}

export default {
    addListener: addListener,
    trigger: trigger,
};
