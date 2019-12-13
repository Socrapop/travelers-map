<?php 

/**
 * Enqueue styles for "new post" or "edit post" pages in administration
 */

add_action( 'admin_enqueue_scripts', 'cttm_styles_admin' );

function cttm_styles_admin( $hook ) {
    if($hook != 'post.php' && $hook != 'post-new.php' && $hook != 'travelers-map_page_cttm_travelersmap_shortcode' && $hook != 'toplevel_page_cttm_travelersmap') {
        return;
    }
      
    wp_register_style('leaflet_css', plugins_url('css/leaflet.css', __FILE__));
    wp_register_style('leaflet_search_css', plugins_url('css/leaflet-search.css', __FILE__));
     wp_register_style('travelers_map_admin_css', plugins_url('css/travelers-map.admin.css', __FILE__));

    wp_enqueue_style('leaflet_css');
    wp_enqueue_style('leaflet_search_css');
    wp_enqueue_style( 'travelers_map_admin_css');        
}

/**
 * Enqueue scripts for "new post" or "edit post" pages in administration
 */

add_action( 'admin_enqueue_scripts', 'cttm_scripts_admin', 10);

function cttm_scripts_admin( $hook ) {


        wp_register_script('travelersmap_admin_notice', plugins_url('js/travelersmap-admin-notice.js', __FILE__),array('jquery'), false, true);
        wp_enqueue_script( 'travelersmap_admin_notice');
        


        if($hook != 'post.php' && $hook != 'post-new.php' && $hook != 'travelers-map_page_cttm_travelersmap_shortcode' && $hook != 'toplevel_page_cttm_travelersmap') {
                return;
        }
        wp_register_script('leaflet', plugins_url('js/leaflet.js', __FILE__));
        wp_register_script('leaflet_search', plugins_url('js/leaflet-search.js', __FILE__));
        wp_enqueue_media();
        if ($hook != 'toplevel_page_cttm_travelersmap') {
             wp_register_script('travelersmap_admin', plugins_url('js/travelersmap.admin.js', __FILE__),array('jquery'), false, true);
        }
        //register travelersmap_admin.js in footer so wp_localize_script() works.
        wp_register_script('travelersmap_admin', plugins_url('js/travelersmap.admin.js', __FILE__),array(), false, true);

        wp_enqueue_script('leaflet');
        wp_enqueue_script('leaflet_search');

        wp_enqueue_script('travelersmap_admin');

	


}

/**
 * Send wp_options parameters to javascript
 */

//We set priority to 20 so it runs after script is enqueued
add_action( 'admin_enqueue_scripts', 'cttm_localize_script', 20);

function cttm_localize_script( $hook ) {
	//Get options from the setting page
    //cttm_options is an array
    $cttm_options = json_encode(get_option( 'cttm_options'));


    //Create the array sent to Javascript
	$cttm_params = array(
	'cttm_options' => $cttm_options
	);

	//Send Json array of all markers to our javascript file 'travelersmap.admin.js'
	wp_localize_script('travelersmap_admin', 'php_params', $cttm_params);
}



/**
 * Adds necessary meta boxes to the post editing screen
 * Lat/lng, Marker ID
 */

add_action( 'add_meta_boxes', 'cttm_add_custom_metaboxes' );

function cttm_add_custom_metaboxes() {
    $cttm_options = get_option( 'cttm_options');
    $posttypes = explode(',', $cttm_options['posttypes']);
    
    add_meta_box( 'LatLngMarker', __( 'Travelers\' Map - Add / edit your post marker', 'travelers-map' ), 'cttm_meta_callback', $posttypes); 
}

/**
 * Output metabox in "new/edit post" pages (and selected custom post types in plugin settings).
 * Display a leaflet map with leaflet-search.js for searching location.
 * Show existing markers to choose from, and a link to add new markers.
 * Display Lat/lng box for entering data manually (auto-complete when clicking on the map or searching a location)
 *  
 */
function cttm_meta_callback($post){
	wp_nonce_field( basename( __FILE__ ), 'cttm_nonce' );
	if (metadata_exists('post', $post->ID, '_latlngmarker')){
	 	$cttm_stored_meta = get_post_meta( $post->ID ,'_latlngmarker', true);
	    extract(json_decode( $cttm_stored_meta, true));

	    $markerurlcleaned = esc_url($markerdata[0]);
	    

	};
   

    //Arguments for querying existing markers created by user
    $cttm_marker_query_args = array(
    	'post_type' => 'cttm-marker',
    	'posts_per_page' => 1,
    	'nopaging' => true,
    	'orderby' => 'ID',
    	'order' => 'ASC'
    )

    ?>
    
    <p>
    	<strong><?php _e( 'Choose a marker:', 'travelers-map' ); ?></strong>
    </p>
    	<style>
    		#cttm-markers label{
				display: inline-block;
				display: inline-flex;
				align-items: center;
				margin: 0 30px 20px 0;
    		}
    	</style>
    	<div id="cttm-markers">
		  <?php
		  //Query user's markers
			$the_query = new WP_Query( $cttm_marker_query_args );
			
			$markerchecked = false; 
            
            if ( $the_query->have_posts() ) {

				while ( $the_query->have_posts() ) {

					$the_query->the_post();
					// For each marker, check if it was selected already and check it by default on page load. 
					
					
					if( isset($markerurlcleaned) && $markerurlcleaned == get_the_post_thumbnail_url()){

						$markerchecked = true;
						echo '<label><input type="radio" name="marker" value="'.get_the_ID().'" checked="checked">';

					}else{

						echo '<label><input type="radio" name="marker" value="'.get_the_ID().'">';
					}
					echo '<img src="'.get_the_post_thumbnail_url().'"></label>';
				}
				
				/* Restore original Post Data */
				wp_reset_postdata();
			}
			?>
		<label>

		<?php  
			// If no marker was selected already, check default marker by default
			if($markerchecked==false){
		   		echo '<input type="radio" name="marker" value="default" checked="checked">';
			}else{
				 echo '<input type="radio" name="marker" value="default">';
			} ?>
		  <img src="<?php echo (plugins_url('images/marker-icon.png', __FILE__)) ?>">
		</label>
		</div>
    <p>
        <strong><?php _e( 'Locate your marker on the map:', 'travelers-map' ); ?></strong>
    </p>
    <div id="travelersmap-container" style="min-height: 400px;width: 100%;"></div>
    <p><strong><?php _e( 'Current marker informations:', 'travelers-map' ); ?></strong></p>
    <div style="margin-bottom: 20px;">
      
        <label for="latitude" class=""><?php _e( 'Latitude', 'travelers-map' ); ?> </label>
        <input id="cttm-latfield" type="number" name="latitude" step="0.00001" max="90" min="-90" value="<?php if ( isset ( $latitude ) ) echo $latitude ?>" />
    
        <label for="longitude" class="" style="margin-left: 20px;"><?php _e( 'Longitude', 'travelers-map' ); ?></label>
        <input id="cttm-lngfield" type="number" name="longitude" step="0.00001" value="<?php if ( isset ( $longitude ) ) echo $longitude ?>" />
        <button id="btn-delete-current-marker" type="button" class="components-button is-link is-destructive" style="margin-left: 20px;"><?php _e( 'Delete current marker', 'travelers-map' ); ?></button>
    </div> 
<?php
}

//Hook cttm_meta_save function only to chosen post_type in plugin settings, using this hook : save_post_{post-type}, WP 3.7 minimum
//Loop through each selected post_type and add action to them
$cttm_options = get_option( 'cttm_options');
$posttypes = explode(',', $cttm_options['posttypes']);

foreach ($posttypes as $posttype) {
    $cttm_action_string = 'save_post_'.$posttype;
    add_action( $cttm_action_string, 'cttm_meta_save' );
}



/**
 * Saves the custom meta input sent by the form
 * This function is doing the following :
 * 1 - Security checks, if something is off, abort
 * 2 - Check every values sent, if something is missing, delete existing values and abort (so to erase a marker, one has to delete a field)
 * 3 - Get all values (latitude, longitude, and marker img URL, width and height) sanitized and compacted in one json array, for database query speed.
 * 4 - Save json array to database
 * 5 - Set current post "hasmarker" term in our private taxonomy 'cttm-markers-tax', so we can easily query every post with a marker without any speed problem. (querying posts by multiple meta-datas can be really slow in Wordpress)
 */
function cttm_meta_save( $post_id ) {
 
    
  
    
	//Don't run on  Wordpress autosave
    if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
    	return;
    }
    //Nonce check for security
    if (!(isset( $_POST[ 'cttm_nonce' ] ) && wp_verify_nonce( $_POST[ 'cttm_nonce' ], basename( __FILE__ ) )) ) {
    	return;
    }
    //Abort if marker is not set
    if (!isset( $_POST[ 'marker' ] )) {
    	return;
    }
    
     // If Latitude & Longitude input are missing or are not valid numbers, delete existing post_meta and terms in private taxonomy, and abort
    if (!is_numeric($_POST[ 'latitude' ]) || !is_numeric($_POST[ 'longitude' ]) || abs($_POST[ 'latitude' ]>90) || abs($_POST[ 'longitude' ])>180) {
    	
    	delete_post_meta( $post_id, '_latlngmarker' );

    	// if term hasmarker is set, remove it. 
    	if (has_term( 'hasmarker', 'cttm-markers-tax', $post_id )){
    		wp_remove_object_terms( $post_id, 'hasmarker', 'cttm-markers-tax' );
    	};
    	return;
    };

    //If marker is default, sanitize and store in $markerdata
    if($_POST[ 'marker' ]=='default'){

    	$markerdata = sanitize_text_field($_POST[ 'marker' ]);

    }
    //else if '$_POST[ 'marker' ]' (post_id) is non-numeric and if it's post type is not 'cttm-marker', abort
    elseif (!is_numeric( $_POST[ 'marker' ]) ||	get_post_type( $_POST[ 'marker' ]) != 'cttm-marker'){
	
		return;

	}
	//If a custom marker is selected,
	//Get marker thumbnail URL, Width and Height
		//$markerdata[0] : Image URL
		//$markerdata[1] : Image Width
		//$markerdata[2] : Image Height
	else{
		
		$markerimg = wp_get_attachment_image_src( get_post_thumbnail_id( $_POST[ 'marker' ] ), "full" );
		$markerdata[] = esc_url_raw($markerimg[0]);
		$markerdata[] = absint( $markerimg[1] );
		$markerdata[] = absint( $markerimg[2] );
	}

	
    //Sanitize latitude, longitude and markerdata.
    //floattostr() is defined at the end of this file.
    $latitude = floattostr($_POST[ 'latitude' ]);
    $longitude = floattostr($_POST[ 'longitude' ]);
 
    // Combine every data in one json array
    $latlngmarker = json_encode(compact('latitude', 'longitude', 'markerdata'));
    // Check value
    if($latlngmarker!=NULL) {
    // Update post meta 
        update_post_meta( $post_id, '_latlngmarker', $latlngmarker ) ;

    // add terms in private taxonomy
        wp_set_post_terms($post_id, 'hasmarker', 'cttm-markers-tax', false);

    }
 
}

/**
 * Sanitize float without displaying scientific notation when using a decimal
 */
function floattostr( $val )
{
    preg_match( "#^([\+\-]|)([0-9]*)(\.([0-9]*?)|)(0*)$#", trim($val), $o );
    return $o[1].sprintf('%d',$o[2]).($o[3]!='.'?$o[3]:'');
}
