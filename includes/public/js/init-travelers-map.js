import { cttmMapLoop } from "./map-loop.js";
import { getShortcodes } from "./shortcode.js";

export function initTravelersMap(doc) {
    const WINDOW = doc.defaultView;

    initializeMaps(WINDOW);

    const shortcodes = getShortcodes(WINDOW);
    shortcodes.forEach((shortcode) => {
        cttmMapLoop(doc, shortcode)
    });

    triggerMapLoadedEvent(doc);
}

function initializeMaps(window) {
    const map = window.cttm_map;
    if (typeof map === 'undefined') {
        window.cttm_map = [];
    } else {
        //if our maps are already initialized, this removes them nicely before initializing them again. Can be used to refresh the maps.
        for (let i = map.length - 1; i >= 0; i--) {
            map[i].remove();
            map.splice(i, 1);
        }
    }
}

// Create an event to know when the maps are loaded and map array is created
// Useful if you want to add a leaflet plugin to your maps.
function triggerMapLoadedEvent(doc) {
    const LOADED_MAP_EVENT = doc.createEvent('Event');
    LOADED_MAP_EVENT.initEvent('cttm_map_loaded', true, true);
    doc.dispatchEvent(LOADED_MAP_EVENT);
}
