<?php
/*
Plugin Name: Travelers' Map
Plugin URI: https://wordpress.org/plugins/travelers-map
Description: Pin your Wordpress posts on a dynamic OpenStreetMap map
Version: 0.8.2
Author: Camille Verrier
Author URI: https://verriercamille.com/
License: GPLv3 or later
*/
/*  Copyright 2019  VERRIER CAMILLE  (email : contact@verriercamille.com)
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

/**
 * Plugin activation function
 */
register_activation_hook(__FILE__, 'cttm_activation');

function cttm_activation() {

    require_once plugin_dir_path( __FILE__ ) . 'cttm-activation.php';
    

}

/**
 * Plugin deactivation function
 */

register_deactivation_hook(__FILE__, 'cttm_deactivation');

function cttm_deactivation() {
}


require_once plugin_dir_path( __FILE__ ) . 'includes/public/cttm-public.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/admin/cttm-admin.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/admin/cttm-shortcode-helper.php';
require_once plugin_dir_path( __FILE__ ) . 'cttm-functions.php';
require_once plugin_dir_path( __FILE__ ) . 'cttm-settings.php';



