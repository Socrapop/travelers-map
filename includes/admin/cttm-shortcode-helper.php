<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

/**
 * Add the shortcode Helper page
 */

//Add the page
add_action( 'admin_menu', 'cttm_add_shortcodehelper');
function cttm_add_shortcodehelper() {
    add_submenu_page("cttm_travelersmap", __( 'Travelers\' Map - Shortcode Helper', 'travelers-map' ), __( 'Shortcode Helper', 'travelers-map' ), "manage_options", "cttm_travelersmap_shortcode", 'cttm_shortcodehelper_page' );
}


//Draw the options page
function cttm_shortcodehelper_page(){
    ?>
    <div class="wrap wrap-shortcode-helper">
        <h1>Travelers' Map  <small>| <?php _e( 'Shortcode Helper', 'travelers-map' ); ?> </small></h1>
        <p><small><?php _e( 'Please understand this plugin is under development. More settings will be added in future updates!', 'travelers-map' ); ?><br><?php printf( __( 'Also, don\'t hesitate to <a href="%1$s" target="_blank">rate this plugin and give me some feedbacks</a> to make Travelers\' Map better!', 'travelers-map' ), 'https://wordpress.org/plugins/travelers-map/#reviews' ); ?></small></p><hr>
        
            <h2><?php _e( 'Your shortcode', 'travelers-map' ); ?></h2>
             <p class="description"><?php _e( 'Copy and paste this shortcode into the content of a Post or a Page to add a dynamic map:', 'travelers-map' ); ?></p>
             <div id="cttm-shortcode-helper" style="padding:10px 20px; background: #dbdbdb; font-weight: bold">[travelers-map]</div><br><br> <hr>
            <h2><?php _e( 'Shortcode settings', 'travelers-map' ); ?></h2>
            <p><?php _e( 'The above shortcode is automatically updated when you modify the settings below :', 'travelers-map' ); ?></p>

            

        <div class="container" style="line-height: 2.2;">
            <label for="width"><strong><?php _e( 'Width:', 'travelers-map' ); ?> </strong></label><input id="width" type="text" placeholder="Default: 100%">
            <br>
                <span class="description"><?php printf( __( ' Any <a href="%1$s" target="_blank">valid CSS unit</a> is accepted. Exemple: <code>780px</code> or <code>50%%</code> ', 'travelers-map' ), 'https://www.w3schools.com/cssref/css_units.asp' ); ?>
                </span>
        </div>
        <br><br>
        <div class="container" style="line-height: 2.2;">
            <label for="height"><strong><?php _e( 'Height:', 'travelers-map' ); ?> </strong></label><input id="height" type="text" placeholder="Default: 600px">
            <br>
            <span class="description"><?php printf( __( ' Any <a href="%1$s" target="_blank">valid CSS unit</a> is accepted, although <code>px</code> and <code>vh</code> are recommended. Exemple: <code>500px</code> or <code>25vh</code>', 'travelers-map' ), 'https://www.w3schools.com/cssref/css_units.asp' ); ?></span>
        </div>
        <br><br>    
        <div class="container" style="line-height: 2.2;">
            <label for="maxwidth"><strong><?php _e( 'Max width:', 'travelers-map' ); ?> </strong></label><input id="maxwidth" type="text" placeholder="Default: none">
           <br>
                <span class="description">
                <?php _e( 'Exemple:', 'travelers-map' ); ?> <code>1200px</code>.</span>
        </div>
        <br><br>   
        <div class="container" style="line-height: 2.2;">
            <label for="maxheight"><strong><?php _e( 'Max height:', 'travelers-map' ); ?> </strong></label><input id="maxheight" type="text" placeholder="Default: none">
            <br>
            <span class="description"><?php _e( 'Exemple:', 'travelers-map' ); ?> <code>800px</code>.</span>
        </div>
        <br>
        
        <div class="container">
            <label><strong><?php _e( 'Categories:', 'travelers-map' ); ?></strong></label><br>
            <p class="description"> <?php _e( 'Select the categories you want to show on the map. Default: All categories.', 'travelers-map' ); ?></p>
            
            <div style="padding: 10px 0 10px 20px; margin: 10px 0 20px; border:#cecece solid 1px; max-width: 1200px;display: inline-block;background: #e8ebf5;">
            <?php 
                 $cttm_allcategories = get_categories( array(
                    'orderby' => 'name',
                    'hide_empty' => false
                 ) );
                 
                 foreach ($cttm_allcategories as $cttm_cat) {
                   
                     echo '<label style="margin-right:20px;"><input type="checkbox" class="cttm-cat-checkbox" name="'.$cttm_cat->name.'" value="'.$cttm_cat->slug.'">'.$cttm_cat->name.'</label>';
                }
            ?>
         </div>
       
        
         
        
    </div>
    <div class="container" >
            <label><strong><?php _e( 'Tags:', 'travelers-map' ); ?></strong></label><br>
            <p class="description"><?php _e( 'Select the tags you want to show on the map. Default: All tags.', 'travelers-map' ); ?></p>
            <div style="padding: 10px 0 10px 20px;margin: 10px 0 20px; border:#cecece solid 1px; max-width: 1200px; display: inline-block; background: #f5ece8;">

            <?php 
                 $cttm_alltags = get_tags( array(
                    'orderby' => 'name',
                    'hide_empty' => false
                 ) );
                 
                 foreach ($cttm_alltags as $cttm_tag) {
                   
                    echo '<label style="margin-right:20px;"><input type="checkbox" class="cttm-tag-checkbox" name="'.$cttm_tag->name.'" value="'.$cttm_tag->slug.'">'.$cttm_tag->name.'</label>';
                }
            ?>
       
        </div>
       <hr>
         
        
    </div>
    <?php
}

