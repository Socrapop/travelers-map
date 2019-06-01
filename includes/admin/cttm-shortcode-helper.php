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
    add_submenu_page("cttm_travelersmap", "Travelers' Map - Shortcode Helper", "Shortcode Helper", "manage_options", "cttm_travelersmap_shortcode", 'cttm_shortcodehelper_page' );
}


//Draw the options page
function cttm_shortcodehelper_page(){
    ?>
    <div class="wrap wrap-shortcode-helper">
        <h1>Travelers' Map  <small>| Shortcode Helper</small></h1>
        <p><small>Please understand this plugin is under development. More settings will be added in future updates!<br>Also, don't hesitate to <a href="https://wordpress.org/plugins/travelers-map/#reviews">rate this plugin</a> and give me some feedbacks to make Travelers' Map better!</small></p><hr>
        
            <h2>Your shortcode</h2>
             <p class="description">Copy and paste this shortcode into the content of a Post or a Page to add a dynamic map:</p>
             <div id="cttm-shortcode-helper" style="padding:10px 20px; background: #dbdbdb; font-weight: bold">[travelers-map]</div><br><br> <hr>
            <h2>Shortcode settings</h2>
            <p>The above shortcode is automatically updated when you modify the settings below :</p>

            

        <div class="container" style="line-height: 2.2;">
            <label for="width"><strong>Width: </strong></label><input id="width" type="text" placeholder="Default: 100%">
            <br>
                <span class="description">Any <a href="https://www.w3schools.com/cssref/css_units.asp" target="_blank">valid CSS unit</a> is accepted.
                Exemple: <code>780px</code> or <code>50%</code>.</span>
        </div>
        <br><br>
        <div class="container" style="line-height: 2.2;">
            <label for="height"><strong>Height: </strong></label><input id="height" type="text" placeholder="Default: 600px">
            <br>
            <span class="description">Any <a href="https://www.w3schools.com/cssref/css_units.asp" target="_blank">valid CSS unit</a> is accepted, although <code>px</code> and <code>vh</code> are recommended. Exemple: <code>500px</code> or <code>25vh</code>.</span>
        </div>
        <br><br>    
        <div class="container" style="line-height: 2.2;">
            <label for="maxwidth"><strong>Max width: </strong></label><input id="maxwidth" type="text" placeholder="Default: none">
           <br>
                <span class="description">
                Exemple: <code>1200px</code>.</span>
        </div>
        <br><br>   
        <div class="container" style="line-height: 2.2;">
            <label for="maxheight"><strong>Max height: </strong></label><input id="maxheight" type="text" placeholder="Default: none">
            <br>
            <span class="description">Exemple: <code>800px</code>.</span>
        </div>
        <br>
        
        <div class="container">
            <label><strong>Categories:</strong></label><br>
            <p class="description"> Select the categories you want to show on the map. Default: All categories.</p>
            
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
            <label><strong>Tags:</strong></label><br>
            <p class="description">Select the tags you want to show on the map. Default: All tags.</p>
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

