<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

/**
 * Add the administration page and insert settings form
 */

//Add the admin options page
add_action( 'admin_menu', 'cttm_add_page',9 );
function cttm_add_page() {
    add_menu_page( "Travelers' Map", "Travelers' Map", "manage_options", "cttm_travelersmap", 'cttm_options_page', 'dashicons-admin-site-alt' );
}

//Draw the options page
function cttm_options_page(){
    ?>
    <div class="wrap">
        <h1>Travelers' Map  
        <?php 
        $cttm_data = get_plugin_data( plugin_dir_path( __FILE__ ) . 'travelers-map.php', false, false);
            ;
        echo "<small>| version ".$cttm_data['Version']."</small>";
        ?>
        </h1>
        <p><small>Please understand this plugin is under development. More settings will be added in future updates!<br>Also, don't hesitate to <a href="https://wordpress.org/plugins/travelers-map/#reviews" target="_blank">rate this plugin and give me some feedbacks</a> to make Travelers' Map better!</small></p><hr>
        <p><strong>Need some help setting up this plugin?</strong><br>
            Please check the <a href="https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/" target="_blank">"Get Started" tutorial</a> on my blog. <br> </p>
            <hr>
        <form action="options.php" method="post">        
            <?php 
                settings_fields('cttm_options');
                do_settings_sections('cttm_travelersmap');?>
                <input type="submit" name="Submit" value="Save Changes" class="button button-primary" style="margin:30px 0">
                <input type="submit" name="Reset" value="Reset settings to default" class="button button-secondary" style="margin:30px 0" onclick="return confirm('Are you sure you wish to reset settings to default? Current settings will be deleted.');">
                <hr style="margin:30px 0">
                
                <h2>Delete all markers and clean database</h2>
                <p>This button cleans every marker information added in your database using this plugin.<br>
                <strong>Please understand this is irreversible.</strong><br></p>
                <input type="submit" name="Delete" value="Delete all markers in database" style="background:#e64949;border-color:#c91c1c;box-shadow: 0 1px 0 #831212;color: #fff;text-decoration: none;text-shadow: 0 -1px 1px #990b00,1px 0 1px #c50e0e,0 1px 1px #990500,-1px 0 1px #900;" class="button" onclick="return confirm('Are you sure you wish to delete every marker in your database? This action is irreversible.');"  >
                <p class="description"><br>To prevent unintentional loss of data, this is how Travelers' Map works: <br>
                    - Upon deactivation, every data (markers and settings) is kept.   <br>
                    - When uninstalling, above settings are deleted from database while markers are kept to prevent unintentional loss. <br>
                </p>
                
                <hr style="margin:30px 0">

            
        </form>
    </div>
    <?php
}

add_action( 'admin_init', 'cttm_admin_init');
function cttm_admin_init(){
    //Register new setting "cttm_options" in database (array). 
    register_setting( 'cttm_options', 'cttm_options', 'cttm_validate_option');
    //add map tiles settings section 
    add_settings_section('map-data-config', 'Map configuration', 'cttm_map_section_html', 'cttm_travelersmap');
    //add every setting field to our section
    add_settings_field( 'tileurl', 'Tiles Server URL', 'cttm_tileurl_html' , 'cttm_travelersmap', 'map-data-config');
    add_settings_field( 'subdomains', 'Tiles Server sub-domains', 'cttm_subdomains_html' , 'cttm_travelersmap', 'map-data-config');
    add_settings_field( 'attribution', 'Attribution', 'cttm_attribution_html' , 'cttm_travelersmap', 'map-data-config');
}

//Draw the section header and help
function cttm_map_section_html(){

}

//Display and fill the form fields
function cttm_tileurl_html(){
    //get option array from database
    $options = get_option('cttm_options');
    $tileurl = $options["tileurl"];
    echo '<input id="tileurl" name="cttm_options[tileurl]" type="text" value="'.$tileurl.'" style="width: 100%;max-width:600px" />';
    echo '<div class="helptext"><br>You can find a list of free tile providers <a href="http://leaflet-extras.github.io/leaflet-providers/preview/" target="_blank">here</a>. 
        <p class="description">If your tile provider require an API key, please insert it directly as explained on their website. <br>
        Exemple (thunderforest): <code>https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}</code></p></div><br>' ;

}

function cttm_subdomains_html(){
  //get option array from database
    $options = get_option('cttm_options');
    $subdomains = $options["subdomains"];
    echo '<input id="subdomains" name="cttm_options[subdomains]" type="text" value="'.$subdomains.'" style="width: 150px;" />';
    echo '<div class="helptext"><br>In this plugin, default is <code>abcd</code> because we use CartoDB. <br>However the most common subdomain is <code>abc</code>, you can find the information on your provider\'s website.<br>
        <p class="description">If you use the <a href="http://leaflet-extras.github.io/leaflet-providers/preview/" target="_blank">free tile providers list</a>, subdomains are displayed when different from "abc".</p><br>';
}

function cttm_attribution_html(){
    //get option array from database
    $options = get_option('cttm_options');
    $attribution = $options["attribution"];

    echo '<script type="text/javascript" charset="utf-8">function cttmGetAttri(e){
        document.getElementById(\'attribution-code\').innerHTML=e.value;
    }</script>';
    echo '<textarea id="attribution" name="cttm_options[attribution]" oninput="cttmGetAttri(this)" style="width: 100%;max-width:800px;" />';

    echo $attribution;
    echo '</textarea>';
    echo '<div class="helptext"><br>Preview: <code id="attribution-code">'.$attribution.'</code>';
    echo '<br><br>Attribution is shown to the lower right of the map. It is necessary to give credit to the Openstreetmap datas and your tile provider. <br> 
        
        <p class="description">It is not necessary, but you can support this plugin by adding : <code> | Built with &lt;a href="https://wordpress.org/plugins/travelers-map/" target="_blank"&gt;Travelers\' Map&lt;/a&gt;</code> </p>';

}
function cttm_validate_option($input){

    //In order to sanitize attribution without removing html code, we load HTMLPurifier http://htmlpurifier.org/
    require_once plugin_dir_path( __FILE__ ) . 'includes/admin/HTMLPurifier/HTMLPurifier.auto.php';
    $config = HTMLPurifier_Config::createDefault();
    $purifier = new HTMLPurifier($config);


    //If Save Changes button is clicked
    if (isset($_POST['Submit'])) {

        $input[ 'tileurl' ] = sanitize_text_field($input[ 'tileurl' ]);
        $input[ 'subdomains' ] = sanitize_text_field( $input[ 'subdomains' ] );
        $input[ 'attribution' ] =  $purifier->purify( $input[ 'attribution' ] );
        return $input;
    }

    //If Reset to default is clicked
    else if (isset($_POST['Reset'])) {

        $cctm_options_default = array(
        'tileurl' => 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'subdomains' => 'abcd',
        'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors and &copy; <a href="https://carto.com/attributions">CARTO</a>' );

        $input[ 'tileurl' ] = sanitize_text_field($cctm_options_default['tileurl']);
        $input[ 'subdomains' ] = sanitize_text_field($cctm_options_default['subdomains']);
        $input[ 'attribution' ] =  $purifier->purify($cctm_options_default['attribution']);
        return $input;
    }

    //If Delete all markers in database is clicked
    else if (isset($_POST['Delete'])){
        //Get all posts with a marker set
        $cttm_delete_args = array(
            'post_type' => 'post',
            'posts_per_page' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'cttm-markers-tax',
                    'terms' => 'hasmarker'
                )
            )
        );

        $cttm_delete_query = new WP_Query( $cttm_delete_args );
        
        if( ($cttm_delete_query->have_posts())) {

            $cttm_posts = $cttm_delete_query->posts;
            
            //for each post with a marker, delete marker meta data, then delete taxonomy "hasmarker"
            foreach($cttm_posts as $post) {
               delete_post_meta($post->ID, '_latlngmarker');
               wp_remove_object_terms( $post->ID, 'hasmarker', 'cttm-markers-tax' ); 
            }
            
        }
        return $input;
    }
}
