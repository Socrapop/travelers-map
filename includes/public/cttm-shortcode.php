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


    //Get post types selected in plugin settings
    $cttm_options = get_option( 'cttm_options');
    $settings_posttypes = $cttm_options['posttypes'];
    $searchfield =  $cttm_options['search_field'];
    $fullscreen = $cttm_options['fullscreen_button'];

    if ($searchfield) {
      wp_enqueue_script('leaflet_search');
      wp_enqueue_style('leaflet_search_css');
    }
    if ($fullscreen) {
       wp_enqueue_script('leaflet_fullscreen');
      wp_enqueue_style('leaflet_fullscreen_css');
    }




   // define attributes and their defaults, return only supported attributes
   // Extract all values to independant variables
    extract(shortcode_atts( array (
        'height' => '600px',
        'width' => '100%',
        "maxwidth" => '',
        "maxheight" => '',
        'cats' => '', //by slug, separated by a comma when multiple categories
        'tags' => '', // by slug, separated by a comma when multiple tags
        'post_types' => $settings_posttypes, // by slug, separated by a comma when multiple posttypes
        'minzoom' => '',
        'maxzoom' =>'',
        'this_post' => false,
        'centered_on_this' => false,
        'init_maxzoom' => 16,
        'post_id' => false
    ), $attr ));
  
    //transform post types string to array
    $post_types = explode(',', $post_types);

     
    //Define the current ID to use in our query if a custom ID or the current post is set in the shortcode.
    //If a custom ID is set in the shortcode, set it as $current_id
    
    if (is_numeric($post_id) ){ 

      $current_id = $post_id;

    } // Else, if the current post has to be shown, or centered on, set its ID as $current_id
    elseif ($this_post==true || $centered_on_this==true){


      global $post;
      $current_id = $post->ID;

    } // Else, set $current_id to false.
    else {

      $current_id = false;

    }
    
    // define query parameters based on shortcode attributes. We only get private taxonomy 'cttm-markers-tax', which is set automatically when a marker is assigned to a post.
    // IF '$current_id' has an ID (see above), we define WP_Query parameters to only get this post/page.
    if ($current_id) {

        $cttm_options_args = array(
            'post__in' => array ($current_id),
            'post_type' => 'any',
            'tax_query' => array(
            array(
                'taxonomy' => 'cttm-markers-tax',
                    'terms' => 'hasmarker'
                )
            ),
          );

    } else {
  
      $cttm_options_args = array(
          'post_type' => $post_types,
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

  
    } 

  // If "centered on this" is set, we get two different queries, to be sure to include current post, even if the other arguments are not including current post:
  // The first is our actual post to zoom on
  // Second is our general query excluding current post
  // Then we merge both into $cttm_query.
  if ($centered_on_this==true && $this_post==false) {
    //Get the single post to zoom on.
    $cttm_query_singlepost = new WP_Query( $cttm_options_args );
    wp_reset_query();
    // We define the query arguments for the other posts, excluding $current_id 
    $cttm_options_args_otherposts = array(
          'post_type' => $post_types,
          'post__not_in' => array($current_id),
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

    //Get the other posts query
    $cttm_query_otherposts = new WP_Query ( $cttm_options_args_otherposts );
   

    //We create a new empty query object, and we merge our two previous query inside it.
    $cttm_query = new WP_Query();
    $cttm_query->posts = array_merge($cttm_query_singlepost->posts, $cttm_query_otherposts->posts);
    //Finally, we update post_count to loop inside our new query
    $cttm_query->post_count = $cttm_query_singlepost->post_count + $cttm_query_otherposts->post_count;
     wp_reset_query();
  }
  else{ //If "Centered on this" is not set, query posts with our arguments
    $cttm_query = new WP_Query( $cttm_options_args );
  }
   
    if( ($cttm_query->have_posts())) { 
      
	    $cttm_posts = $cttm_query->posts;
	    $i = 0;
	    
		foreach($cttm_posts as $cttm_post) { // LOOP


    	   		//for each posts get informations: 
    	   		//postdatas() is an array of the post thumbnail, url and title
    		    	//latlngmarkerarr() is an array with only one value, a json array of markers' latitude, longitude and image url(<- or string "default").
    			
                $cttm_postdatas = array();
          		  $cttm_postdatas['thumb'] = get_the_post_thumbnail_url($cttm_post->ID, "travelersmap-thumb" );
         			  $cttm_postdatas['url'] = get_permalink($cttm_post->ID);
          			$cttm_postdatas['thetitle'] = get_the_title($cttm_post->ID);
                $cttm_postdatas['excerpt'] = get_the_excerpt( $cttm_post->ID );
              
      			    $latlngmarkerarr = get_post_meta( $cttm_post->ID, '_latlngmarker');
      			
      			   //Create the $cttm_metas array to store all the markers and posts informations. This will be send to out javascript file
      		     $cttm_metas[$i]['markerdatas'] = $latlngmarkerarr[0];
      			   $cttm_metas[$i]['postdatas'] = $cttm_postdatas;

      			   $i+=1;
       
      }//End foreach

	 } else { //End If have_posts()
        $cttm_metas = 0;  
    }
	//json_encode the array to send it to our javascript
    $cttm_metas = json_encode($cttm_metas);

    //Get options from the setting page to show the map in front-end
    //cttm_options is an array
    $cttm_options_json = json_encode(get_option( 'cttm_options'));


    $id = uniqid();
    $containerid = "travelersmap-container-".$id;

    //Create shortcode options array to send to javascript
    $cttm_shortcode_options = array();
    $cttm_shortcode_options['id'] = $id;
    $cttm_shortcode_options['minzoom'] = $minzoom;
    $cttm_shortcode_options['maxzoom'] = $maxzoom;
    $cttm_shortcode_options['this_post'] = (string)$this_post;
    $cttm_shortcode_options['init_maxzoom'] = $init_maxzoom;
    $cttm_shortcode_options['centered_on_this'] = (string)$centered_on_this;

    //Encode to Json
    
    $cttm_shortcode_options = json_encode($cttm_shortcode_options);

    //Create the array sent to Javascript
	$cttm_options_params = array(
	'cttm_options' => $cttm_options_json
	);

    //Create the array with shortcode options
  ${"cttm_shortcode_$id"} = array(
    'cttm_metas' => $cttm_metas,
    'cttm_shortcode_options' => $cttm_shortcode_options
  );

	//Send Json variables to our javascript file 'travelersmap.js'
	wp_localize_script('travelersmap_init', 'cttm_options_params', $cttm_options_params);
  wp_localize_script('travelersmap_init', 'cttm_shortcode_'.$id,  ${"cttm_shortcode_$id"});

    
     $cttm_output = '<div id="'.$containerid.'" class="travelersmap-container" style="min-height: 10px; min-width:10px; height:'.$height.';width:'.$width.'; max-width:'.$maxwidth.'; max-height:'.$maxheight.'; "><div style="position:absolute; z-index:-1;top: 50%;text-align: center;display: block;left: 50%;transform: translate(-50%,-50%);">Travelers\' Map is loading... <br> If you see this after your page is loaded completely, leafletJS files are missing.</div></div>';
  
  
	return $cttm_output;
}

