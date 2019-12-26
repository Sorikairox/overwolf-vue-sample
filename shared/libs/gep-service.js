/**
 * Game Event Provider service
 * This will listen to events from the game provided by
 * Overwolf's Game Events Provider
 */

import EVENTS from '../constants/events';


const REQUIRED_FEATURES = EVENTS.LIST;
const REGISTER_RETRY_TIMEOUT = 10000;
const INPUT_TRACKING_LIST = ['onKeyUp', 'onKeyDown', 'onMouseUp', 'onMouseDown'];

function registerToGEP(eventsListener, infoListener, inputListener) {
    // set the features we are interested in receiving
    overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function (response) {
        if (response.status === 'error') {
            console.log(`Failed to register to GEP, retrying in ${REGISTER_RETRY_TIMEOUT / 1000}s...`);
            setTimeout(registerToGEP, REGISTER_RETRY_TIMEOUT, eventsListener, infoListener, inputListener);
        }
        else if (response.status === 'success') {
            console.log(`Successfully registered to GEP.`);
            // Listen to game events. We call 'removeListener' before
            // 'addListener' to make sure we don't listen multiple times
            overwolf.games.events.onNewEvents.removeListener(eventsListener);
            overwolf.games.events.onNewEvents.addListener(eventsListener);

            // Listen to info updates
            overwolf.games.events.onInfoUpdates2.removeListener(infoListener);
            overwolf.games.events.onInfoUpdates2.addListener(infoListener);

            for (let input of INPUT_TRACKING_LIST) {
                overwolf.games.inputTracking[input].removeListener(inputListener[input]);
                overwolf.games.inputTracking[input].addListener(inputListener[input]);
            }
        }
    });
}

export default {
    registerToGEP: registerToGEP,
};
