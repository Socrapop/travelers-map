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
    'popup_style' => 'thumbnail,title',
    'popup_css' => 0,
    'search_field' => 0,
    'fullscreen_button' => 0,
    'onefinger' => 0
);

$cttm_options = get_option('cttm_options', array());

$cttm_updated_options = array_merge($cttm_default_options, $cttm_options);

// popup_style has been reworked in version 1.11.0
// To avoid error when updating the plugin,
// we convert the old options ('img_title', 'img_title_descr' or 'title_descr') to the new format

$cttm_popup_style = $cttm_updated_options['popup_style'];
switch ($cttm_popup_style) {
    case 'img_title':
        $cttm_updated_options['popup_style'] = 'thumbnail,title';
        break;
    case 'img_title_descr':
        $cttm_updated_options['popup_style'] = 'thumbnail,title,excerpt';
        break;
    case 'title_descr':
        $cttm_updated_options['popup_style'] = 'title,excerpt';
        break;
}

update_option('cttm_options', $cttm_updated_options);
