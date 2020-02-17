<?php

// Exit if accessed directly
if (!defined('ABSPATH')) {
	exit;
}

cttm_option_update();

/**
 * Create default markers custom posts
 */

cttm_create_new_marker(__('Default - Black', 'travelers-map'), 'black', 'cttm_markers-black.png');
cttm_create_new_marker(__('Default - Violet', 'travelers-map'), 'violet', 'cttm_markers-violet.png');
cttm_create_new_marker(__('Default - Red', 'travelers-map'), 'red', 'cttm_markers-red.png');
cttm_create_new_marker(__('Default - Orange', 'travelers-map'), 'orange', 'cttm_markers-orange.png');
cttm_create_new_marker(__('Default - Green', 'travelers-map'), 'green', 'cttm_markers-green.png');
cttm_create_new_marker(__('Default - Blue', 'travelers-map'), 'blue', 'cttm_markers-blue.png');


// Create a post in custom post type cttm-marker, using $title as title and $imagename for the thumbnail.
function cttm_create_new_marker($title, $content, $imagename)
{

	//Check if post exist by title and content, so we don't duplicate posts on re-activation of plugin
	if (post_exists($title, $content) == 0) {

		$cttm_marker_post = array(
			'post_title'    => $title,
			'post_content'  => $content,
			'post_type'	  => "cttm-marker",
			'post_status'   => 'publish'
		);
		//Insert post, return the id of the newly created post. If there is an error, return 0.
		$cttm_post_id = wp_insert_post($cttm_marker_post);

		//Check if returned id is different from 0.
		if ($cttm_post_id != 0) {

			//Set file url with $imagename
			$cttm_file_url = plugin_dir_url(__FILE__) . 'images/' . $imagename;
			//Download the image from specified URL and attach it to post
			$cttm_image_id = media_sideload_image($cttm_file_url, $cttm_post_id, null, 'id');
			//check if image was downloaded without error
			if (!is_wp_error($cttm_image_id)) {
				set_post_thumbnail($cttm_post_id, $cttm_image_id);
			}
		}
	}
}
