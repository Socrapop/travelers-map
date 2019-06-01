<?php 
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

/**
 * Display leaflet map
 */
add_shortcode( 'travelersmap', 'cttm_shortcode' );
add_shortcode( 'travelers-map', 'cttm_shortcode' );

function cttm_shortcode($attr) {
  //enqueue styles and scripts when shortcode is used
  wp_enqueue_style('leaflet_css');
  wp_enqueue_style('travelersmap_css');
   wp_enqueue_style('leaflet_markerclustercss');

  wp_enqueue_script('leaflet');
  wp_enqueue_script('leaflet_markercluster');
  wp_enqueue_script('travelersmap_init');


   // define attributes and their defaults, return only supported attributes
    extract(shortcode_atts( array (
        'height' => '600px',
        'width' => '100%',
        "maxwidth" => '',
        "maxheight" => '',
        'cats' => '', //by slug, separated by a comma when multiple categories
        'tags' => '' // by slug, separated by a comma when multiple tags
    ), $attr ));
  
    // define query parameters based on shortcode attributes. We only get private taxonomy 'cttm-markers-tax', which is set automatically when a marker is assigned to a post.
    $cttm_options = array(
        'post_type' => 'post',
        'posts_per_page' => -1,
        'tax_query' => array(
        	array(
				'taxonomy' => 'cttm-markers-tax',
        		'terms' => 'hasmarker'
			)
        ),
        'tag' => $tags,
        'category_name' => $cats
    );

    
    $cttm_query = new WP_Query( $cttm_options );
    if( ($cttm_query->have_posts())) {

	    $cttm_posts = $cttm_query->posts;
	    $i = 0;
	    
		foreach($cttm_posts as $post) {
			//for each posts get informations : 
			//postdatas() is an array of the post thumbnail, url and title
			//latlngmarkerarr() is an array with only one value, a json array of markers' latitude, longitude and image url(<- or string "default").
			
			$cttm_postdatas = array();
		    $cttm_postdatas['thumb'] = get_the_post_thumbnail_url($post->ID, "travelersmap-thumb" );
			$cttm_postdatas['url'] = get_permalink($post->ID);
			$cttm_postdatas['thetitle'] = get_the_title($post->ID);
			$latlngmarkerarr = get_post_meta( $post->ID, '_latlngmarker');
			
			//Create the $cttm_metas array to store all the markers and posts informations. This will be send to out javascript file
		    $cttm_metas[$i]['markerdatas'] = $latlngmarkerarr[0];
			$cttm_metas[$i]['postdatas'] = $cttm_postdatas;

			$i+=1;
		}
		
	} else {
          $cttm_metas = 0;
    }
	//json_encode the array to send it to our javascript
    $cttm_metas = json_encode($cttm_metas);

    //Get options from the setting page to show the map in front-end
    //cttm_options is an array, containing 'tileurl', 'subdomains' and 'attribution'
    $cttm_options = json_encode(get_option( 'cttm_options'));


    //Create the array sent to Javascript
	$cttm_params = array(
	'cttm_metas' => $cttm_metas,
	'cttm_options' => $cttm_options
	);

	//Send Json array of all markers to our javascript file 'travelersmap.js'
	wp_localize_script('travelersmap_init', 'php_params', $cttm_params);

    
    //min-height and min-width are here to prevent users not seeing their map in case they enter a wrong height or width.
  $cttm_output = '<div id="travelersmap-container" style="min-height: 10px; min-width:10px; height:'.$height.';width:'.$width.'; max-width:'.$maxwidth.'; max-height:'.$maxheight.'; "></div>';
	return $cttm_output;
}

