<?php

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

update_option('travelersmap_version', TRAVELERSMAP_VERSION);

/**
 * Set default options
 */
    // Travelers map default options 
    $cttm_default_options = array(
        'posttypes' => 'post',
        'tileurl' => 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'subdomains' => 'abcd',
        'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors and &copy; <a href="https://carto.com/attributions">CARTO</a>',
        'popup_style' => 'img_title',
        'popup_css' => 0,
        'search_field' => 0,
        'fullscreen_button' => 0,
        'onefinger' => 0 );

    $cttm_options = get_option('cttm_options', array());

    $cttm_options = array_merge($cttm_default_options, $cttm_options);

    update_option( 'cttm_options', $cttm_options );


