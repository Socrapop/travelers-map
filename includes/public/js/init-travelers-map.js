import { cttmMapLoop } from "./map-loop.js";

export function initTravelersMap() {
    /**
     * Get plugin options from database
     */

    //Retrieve and store all shortcodes data arrays sent by php in "cttm_shortcode_vars_arr"
    let cttm_shortcode_vars_arr = new Array();

    //Search for every js variable beginning with "cttm_shortcode_"
    let cttm_varname_pattern = /^cttm_shortcode_/;
    for (let cttm_varName in window) {
        if (cttm_varname_pattern.test(cttm_varName)) {
            cttm_shortcode_vars_arr.push(window[cttm_varName]);
        }
    }
    /**
     * Loop : Create a new map for each shortcode in the page
     * Before the loop, initialize global array of map objects and index number
     */

    //Create cttm_map public array of object if not already created
    if (typeof cttm_map === 'undefined') {
        window.cttm_map = new Array();
    } else {
        //if our maps are already initialized, this removes them nicely before initializing them again. Can be used to refresh the maps.
        for (let i = cttm_map.length - 1; i >= 0; i--) {
            cttm_map[i].remove();
            cttm_map.splice(i, 1);
        }
    }

    cttm_shortcode_vars_arr.forEach(cttmMapLoop);

    // Create event to listen to know when the maps are loaded and cttm_map array is created
    // Useful if you want to add a leaflet plugin to your maps.
    let event_cttm = document.createEvent('Event');

    // Define that the event name is 'build'.
    event_cttm.initEvent('cttm_map_loaded', true, true);

    // target can be any Element or other EventTarget.
    document.dispatchEvent(event_cttm);
}
