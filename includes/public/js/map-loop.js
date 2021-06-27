import { cttmGeneratePopoverHTMLOutput } from "./generate-popover-html-output.js";
import { cttmPopulatePopoversHTMLOutput } from "./populate-popovers-html-output.js";

export function cttmMapLoop(cttm_shortcode_vars) {
    //Get plugin options from the database, set in the setting page.
    let json_cttm_options = cttm_options_params.cttm_options;

    //If no markers are loaded, return without initiating leaflet
    if (cttm_shortcode_vars.cttm_metas == '0') {
        return;
    }
    //Get shortcode options
    let json_cttm_shortcode = cttm_shortcode_vars.cttm_shortcode_options;

    //Clean json string to be usable
    json_cttm_options = json_cttm_options.replace(/&quot;/g, '\\"');
    json_cttm_shortcode = json_cttm_shortcode.replace(/&quot;/g, '\\"');

    //Get arrays of all the options and shortcode options
    let cttm_options = JSON.parse(json_cttm_options);
    var cttm_shortcode_options = JSON.parse(json_cttm_shortcode);

    /**
     * Create leaflet map options object. This object is then passed as argument when the map initialized.
     */
    let cttm_map_options = new Object();

    //Add max bounds on north and south of the map
    cttm_map_options.maxBounds = [
        [-90, -Infinity],
        [90, Infinity],
    ];

    // If one-finger touch event is disabled on mobile
    if (cttm_options['onefinger']) {
        cttm_map_options.dragging = !L.Browser.mobile;
        cttm_map_options.tap = !L.Browser.mobile;
    }
    //Set maxzoom if defined
    if (cttm_shortcode_options.maxzoom != '') {
        cttm_map_options.maxZoom = cttm_shortcode_options.maxzoom;
    }
    //Set minzoom if defined
    if (cttm_shortcode_options.minzoom != '') {
        cttm_map_options.minZoom = cttm_shortcode_options.minzoom;
    }
    //Set init_maxzoom if defined. Convert to integer to avoid error.
    if (cttm_shortcode_options.init_maxzoom) {
        var init_maxzoom = parseInt(cttm_shortcode_options.init_maxzoom);
    } else {
        var init_maxzoom = 16;
    }

    if (cttm_shortcode_options.max_cluster_radius) {
        var max_cluster_radius = parseInt(
            cttm_shortcode_options.max_cluster_radius
        );
    } else {
        var max_cluster_radius = 45;
    }

    /**
     * Create leaflet map object "cttm_map"
     */

    //Get cttm_map container id
    let containerid = cttm_shortcode_options.id;
    let container = document.getElementById(
        'travelersmap-container-' + containerid
    );

    //Prevent some plugins incompatibilities where the shortcode is executed multiple times, sending additionnal cttm_shortcode_... variables in the front-end.
    // This way, we prevent an error where the container was not found, by stopping the script if the container is not found.
    if (!container) {
        console.warn(
            "Travelers' Map container with id: " + containerid + ' was not found.'
        );
        return;
    }

    //Set Tiles Server URL + API key + Attribution
    //If a shortcode tile server is set, override global settings' tile server
    let tileurl, subdomains, attribution;
    if (cttm_shortcode_options.tileurl !== '') {
        tileurl = cttm_shortcode_options.tileurl;
    } else {
        tileurl = cttm_options['tileurl'];
    }
    if (cttm_shortcode_options.subdomains !== '') {
        subdomains = cttm_shortcode_options.subdomains;
    } else {
        subdomains = cttm_options['subdomains'];
    }
    if (cttm_shortcode_options.attribution !== '') {
        attribution = cttm_shortcode_options.attribution;
    } else {
        attribution = cttm_options['attribution'];
    }

    //Index of map objects in array
    let mapindex = 0;

    //Push current map object to array
    cttm_map.push(L.map(container, cttm_map_options));
    //Get Tiles server URL + API key + Attribution
    L.tileLayer(tileurl, {
        subdomains: subdomains,
        attribution: attribution,
    }).addTo(cttm_map[mapindex]);

    /**
     * Disable Scrollwheel zoom when map is not in focus
     */
    cttm_map[mapindex].scrollWheelZoom.disable();
    //Enable Scrollwheel Zoom on focus
    cttm_map[mapindex].on('focus', function (e) {
        this.scrollWheelZoom.enable();
    });

    /**
     * Create all markers and popovers, and add them to the leaflet map.
     */

    //Change default leaflet icon options
    L.Icon.Default.prototype.options.iconSize = [32, 45];
    L.Icon.Default.prototype.options.iconAnchor = [16, 45];
    L.Icon.Default.prototype.options.popupAnchor = [0, -42];
    L.Icon.Default.prototype.options.shadowSize = [0, 0];

    //Create a markerClusterGroup if Clustering is activated (default),
    //else, create a FeatureGroup instead (we need "getBounds()" method for initial zoom, that's why we don't use a LayerGroup.)
    let markersGroup;
    if (cttm_shortcode_options.disable_clustering === 'true') {
        markersGroup = L.featureGroup();
    } else {
        //default
        markersGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: max_cluster_radius,
            spiderLegPolylineOptions: {
                weight: 3,
                color: 'rgb(110, 204, 57)',
                opacity: 0.6,
                lineCap: 'round',
            },
            spiderfyDistanceMultiplier: 2.5,
        });
    }

    // Generate Popover HTML Output and assign them to variables
    let [popoverOutput, popoverOptions] = cttmGeneratePopoverHTMLOutput(
        cttm_shortcode_options,
        cttm_options
    );

    //Get markers metas and linked posts datas from shortcode
    let json_cttm_metas = cttm_shortcode_vars.cttm_metas;

    //If posts with markers exist
    if (json_cttm_metas != 0) {
        //Clean json string to be usable
        json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '\\"');

        //Get an array of objects containing markerdatas and postdatas
        const cttm_metas = JSON.parse(json_cttm_metas);

        //Loop through cttm_metas array, create all the markers and popovers.
        for (let i = 0; i < cttm_metas.length; i++) {
            //If current markerdata is not falsy:
            //Prevent bug with multilingual plugins, where metadatas are synced but not taxonomy:
            //If one remove a marker from a post, the other languages of this post will still appear in the query...
            if (cttm_metas[i].markerdatas) {
                //Get markerdatas object
                let markerdatas = JSON.parse(cttm_metas[i].markerdatas);

                //Initialize all markers variables
                let markerlatitude = markerdatas.latitude;
                let markerlongitude = markerdatas.longitude;
                let markerURL = markerdatas.markerdata[0];
                let markerwidth = markerdatas.markerdata[1];
                let markerheight = markerdatas.markerdata[2];

                //Get linked postdatas object
                let postdatas = Object.assign({}, cttm_metas[i].postdatas);

                //Alter postdatas array in case we have custom data set
                if (markerdatas.customtitle) {
                    postdatas.thetitle = markerdatas.customtitle;
                }
                if (markerdatas.customexcerpt) {
                    postdatas.excerpt = markerdatas.customexcerpt;
                }
                if (markerdatas.customthumbnail) {
                    postdatas.thumb = markerdatas.customthumbnail;
                }
                // Create a leaflet icon object and add it to the map, if not set, use default
                //"d" is returned when no icon is set
                if (markerURL != 'd') {
                    //Create custom icon
                    let myIcon = L.icon({
                        iconUrl: markerURL,
                        iconSize: [markerwidth, markerheight],
                        iconAnchor: [markerwidth / 2, markerheight],
                        popupAnchor: [0, -markerheight + 3],
                    });
                    //Create marker object wih our icon
                    var marker = L.marker([markerlatitude, markerlongitude], {
                        icon: myIcon,
                    });
                } else {
                    //Create marker object with default icon
                    var marker = L.marker([markerlatitude, markerlongitude]);
                }

                let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
                    postdatas,
                    popoverOutput,
                    cttm_options
                );

                //If "this_post" option is set
                //Add the marker in our cluster group layer without popover
                //Else add it with its popover
                if (cttm_shortcode_options.this_post == 'true') {
                    markersGroup.addLayer(marker);
                } else {
                    markersGroup.addLayer(
                        marker.bindPopup(postPopoverOutput, popoverOptions)
                    );
                }

                //Second loop for multiplemarkers
                if (markerdatas.multiplemarkers) {
                    for (let index = 1; index < markerdatas.multiplemarkers; index++) {
                        let postdatas = Object.assign({}, cttm_metas[i].postdatas);
                        //Get markerdatas object
                        let markerdatasMultiple =
                            markerdatas['additional_marker_' + index];

                        //Initialize all markers variables
                        let markerlatitude = markerdatasMultiple.latitude;
                        let markerlongitude = markerdatasMultiple.longitude;
                        let markerURL = markerdatasMultiple.markerdata[0];
                        let markerwidth = markerdatasMultiple.markerdata[1];
                        let markerheight = markerdatasMultiple.markerdata[2];

                        //Alter postdatas array in case we have custom data set
                        if (markerdatasMultiple.customtitle) {
                            postdatas.thetitle = markerdatasMultiple.customtitle;
                        }
                        if (markerdatasMultiple.customexcerpt) {
                            postdatas.excerpt = markerdatasMultiple.customexcerpt;
                        }
                        if (markerdatasMultiple.customthumbnail) {
                            postdatas.thumb = markerdatasMultiple.customthumbnail;
                        }
                        // Create a leaflet icon object and add it to the map, if not set, use default
                        //"d" is returned when no icon is set
                        if (markerURL != 'd') {
                            //Create custom icon
                            let myIcon = L.icon({
                                iconUrl: markerURL,
                                iconSize: [markerwidth, markerheight],
                                iconAnchor: [markerwidth / 2, markerheight],
                                popupAnchor: [0, -markerheight + 3],
                            });
                            //Create marker object wih our icon
                            var marker = L.marker([markerlatitude, markerlongitude], {
                                icon: myIcon,
                            });
                        } else {
                            //Create marker object with default icon
                            var marker = L.marker([markerlatitude, markerlongitude]);
                        }

                        let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
                            postdatas,
                            popoverOutput,
                            cttm_options
                        );

                        //If "this_post" option is set
                        //Add the marker in our cluster group layer without popover
                        //Else add it with its popover
                        if (cttm_shortcode_options.this_post == 'true') {
                            markersGroup.addLayer(marker);
                        } else {
                            markersGroup.addLayer(
                                marker.bindPopup(postPopoverOutput, popoverOptions)
                            );
                        }
                    }
                }
            } //END if(markerdatas)
        } //END For Loop through cttm_metas

        //add Leaflet.search to the map when option is checked
        if (cttm_options['search_field'] == 1) {
            cttm_map[mapindex].addControl(
                new L.Control.Search({
                    url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
                    jsonpParam: 'json_callback',
                    propertyName: 'display_name',
                    propertyLoc: ['lat', 'lon'],
                    autoCollapse: false,
                    collapsed: false,
                    autoType: true,
                    minLength: 2,
                    zoom: 13,
                    firstTipSubmit: true,
                    hideMarkerOnCollapse: true,
                })
            );

            //On focus, enable zoom with mousewheel on map.
            document.querySelector('#searchtext9').addEventListener(
                'focus',
                function () {
                    cttm_map[mapindex].scrollWheelZoom.enable();
                },
                true
            );
        }

        //add Leaflet.fullscreen to the map when option is checked
        if (cttm_options['fullscreen_button'] == 1) {
            cttm_map[mapindex].addControl(
                new L.Control.Fullscreen({
                    position: 'topright',
                })
            );
        }

        //add markercluster layer to the map
        cttm_map[mapindex].addLayer(markersGroup);

        //Set the initial view
        //If centered_on_this is set, set view on this post
        if (cttm_shortcode_options.centered_on_this == 'true') {
            //get the marker latitude and longitude, the first of our query.
            let centered_on_marker = JSON.parse(cttm_metas[0].markerdatas);
            let centerlatitude = centered_on_marker.latitude;
            let centerlongitude = centered_on_marker.longitude;

            cttm_map[mapindex].setView(
                [centerlatitude, centerlongitude],
                init_maxzoom
            );
        } else {
            //If centered_on_this is not set, fit the view to see every maker on the map
            cttm_map[mapindex].fitBounds(markersGroup.getBounds(), {
                padding: [60, 60],
                maxZoom: init_maxzoom,
            });
        }
    } //END if (!json_cttm_metas)

    //Recalculate map size after 100ms to avoid problems with page builders changing element size on document load.
    //Avoid problem with tiles not loading inside the whole container.
    const mapindexcopy = mapindex;
    setTimeout(() => {
        cttm_map[mapindexcopy].invalidateSize();
    }, 1000);

    mapindex++;
}
