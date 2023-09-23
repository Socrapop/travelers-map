/**
 * Generate unpopulated markers popovers HTML from the options set by the user.
 * The user can choose what to show inside every popover in Travelers' Map setting page.
 *
 * @param {object} cttm_shortcode_options contains all useful shortcode parameters currently set. We use
 * @param {object} cttm_options contains all useful plugins general settings set
 * @returns [popoverOutput,popoverOptions] an array of the HTML output and the popoverOptions object for leaflet
 */
export function cttmGeneratePopoverHTMLOutput(cttm_shortcode_options, cttm_options) {
    //Define popovers depending of plugin setting.
    //First we create target property value _self (same tab) or _blank (new tab) for our <a> tag.
    let popoverTarget;
    let popoverOutput;
    let popoverOptions;
    if (cttm_shortcode_options.open_link_in_new_tab === 'true') {
        popoverTarget = '_blank';
    } else {
        popoverTarget = '_self';
    }
    //Then we create HMTL output for popovers depending of style set in plugin settings
    let popoverStyles = cttm_options['popup_style'].split(',');

    if (popoverStyles.indexOf('thumbnail') != -1) {
        if (popoverStyles.indexOf('excerpt') != -1) {
            //Detailed Popup : Thumbnail and excerpt, with (title) and (date). () = optionnal
            popoverOptions = { className: 'detailed-popup' };
            popoverOutput =
                '<a class="tooltip-link" href="%s_url" target="' + popoverTarget + '">';
            popoverOutput += '<div class="nothumbplaceholder"></div>';
            popoverOutput += '<div class="title">%s_title</div>';
            popoverOutput += '<div class="date">%s_date</div></a>';
            popoverOutput += '%s_customfields';
            popoverOutput += '<div class="excerpt">%s_excerpt</div>';
        } else {
            //Default Popup : Thumbnail with (title) and (date). () = optionnal
            popoverOptions = { className: 'default-popup' };

            popoverOutput = '<div class="img-mask">';
            popoverOutput += '<div class="nothumbplaceholder"></div>';
            popoverOutput +=
                '</div><a class="tooltip-link" href="%s_url" target="' +
                popoverTarget +
                '">';
            popoverOutput += '<div class="popup-thumb-text-wrapper">';
            popoverOutput += '<div class="title">%s_title</div>';
            popoverOutput += '<div class="date">%s_date</div>';
            popoverOutput += '%s_customfields';
            popoverOutput += '</div></a>';
        }
    } else {
        //Textual Popup : excerpt, title and date. At least one or more of those.
        popoverOptions = { className: 'textual-popup' };

        popoverOutput =
            '<a class="tooltip-link" href="%s_url" target="' + popoverTarget + '">';
        popoverOutput += '<div class="title">%s_title</div>';
        popoverOutput += '<div class="date">%s_date</div>';
        popoverOutput += '%s_customfields';
        popoverOutput += '<div class="excerpt">%s_excerpt</div></a>';
    }

    //If css is disabled, change popover class
    if (cttm_options['popup_css']) {
        popoverOptions = { className: 'custom-popup' };
    }
    return [popoverOutput, popoverOptions];
}