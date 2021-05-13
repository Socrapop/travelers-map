document.addEventListener('DOMContentLoaded', function (event) {
  //IF it's a post edit page with the plugin initialized.
  if (document.getElementById('cttm-latfield') != null) {
    // Set needed variables
    var iconurl;
    var latinput = document.getElementById('cttm-latfield');
    var lnginput = document.getElementById('cttm-lngfield');
    var deletemarkerbtn = document.getElementById('btn-delete-current-marker');

    // Get all markers input, and loop through each
    var radios = document
      .getElementById('cttm-markers')
      .querySelectorAll("input[name='marker']");
    for (var i = 0, max = radios.length; i < max; i++) {
      //Get current selected marker icon and
      //create myIcon object for leaflet
      if (radios[i].checked == true) {
        iconurl = radios[i].nextElementSibling.currentSrc;
        var imgwidth = radios[i].nextElementSibling.width;
        var imgheight = radios[i].nextElementSibling.height;
        var iconAnchor = [parseInt(imgwidth / 2), imgheight];

        var myIcon = L.icon({
          iconUrl: iconurl,
          iconAnchor: iconAnchor,
        });
      }

      //Bind onchange event on radio button
      //Onchange, get new marker icon and
      //change myIcon object
      radios[i].onchange = function () {
        if (this.checked == true) {
          iconurl = this.nextElementSibling.currentSrc;
          imgwidth = this.nextElementSibling.width;
          imgheight = this.nextElementSibling.height;
          iconAnchor = [parseInt(imgwidth / 2), imgheight];
          myIcon = L.icon({
            iconUrl: iconurl,
            iconAnchor: iconAnchor,
          });
          //if marker is already displayed on the map, change marker icon
          if (marker) {
            marker.setIcon(myIcon);
          }
        }
      };
    }

    // Init Leaflet
    var cttm_map = L.map('travelersmap-container').setView(
      [45.280712, 5.89],
      3
    ); //Zoom 3

    //InvalidateSize after 100ms for map resize issue in gutenberg
    setTimeout(function(){ 
      cttm_map.invalidateSize();
    }, 100);
    
    //Disable Scrollwheel zoom when map is not in focus
    cttm_map.scrollWheelZoom.disable();

    //Enable Scrollwheel Zoom on focus
    cttm_map.on('focus', () => {
      cttm_map.scrollWheelZoom.enable();
    });

    /**
     * Get options from database to assign a tile layer to the cttm_map
     */

    //Get plugin options from the database, set in the setting page.
    var json_cttm_options = php_params.cttm_options;

    //Clean json string to be usable
    json_cttm_options = json_cttm_options.replace(/&quot;/g, '"');

    //Get an array of all the options
    cttm_options = JSON.parse(json_cttm_options);

    //Get Tiles server URL + API key + Attribution
    L.tileLayer(cttm_options['tileurl'], {
      subdomains: cttm_options['subdomains'],
      attribution: cttm_options['attribution'],
      noWrap: true,
      bounds: [
        [-90, -180],
        [90, 180],
      ],
    }).addTo(cttm_map);

    //Set marker on map if already chosen

    var marker;

    if (latinput.value != '' && lnginput.value != '') {
      marker = L.marker([latinput.value, lnginput.value], {
        draggable: true,
        icon: myIcon,
      }).addTo(cttm_map);
      cttm_map.setView([latinput.value, lnginput.value]);

      //If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
      marker.on('dragend', function (e) {
        latinput.value = e.target._latlng.lat.toFixed(5);
        lnginput.value = e.target._latlng.lng.toFixed(5);
      });
    }

    //On map click, add a marker or move the existing one to the click location
    cttm_map.on('click', function (e) {
      // If a marker already exist
      if (cttm_map.hasLayer(marker)) {
        //add transition style only on click, we don't want the transition if the user drag&drop the marker.
        marker._icon.style.transition = 'transform 0.3s ease-out';

        // set new latitude and longitude
        marker.setLatLng(e.latlng);

        //remove transform style after the transition timeout
        setTimeout(function () {
          marker._icon.style.transition = null;
        }, 300);
        //Change the form latitude and longitude, keeping only 5 decimals
        latinput.value = e.latlng.lat.toFixed(5);
        lnginput.value = e.latlng.lng.toFixed(5);
      }
      // If no marker exist, create one and add it the map
      else {
        marker = L.marker(e.latlng, {
          draggable: true,
          icon: myIcon,
        }).addTo(cttm_map);

        //Change the form latitude and longitude, keeping only 5 decimals
        latinput.value = e.latlng.lat.toFixed(5);
        lnginput.value = e.latlng.lng.toFixed(5);

        //If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
        marker.on('dragend', function (e) {
          latinput.value = e.target._latlng.lat.toFixed(5);
          lnginput.value = e.target._latlng.lng.toFixed(5);
        });
      }
      return;
    });

    //add Leaflet.search to the map
    //This is very useful to rapidly find a place
    cttm_map.addControl(
      new L.Control.Search({
        url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        autoCollapse: false,
        collapsed: false,
        autoType: true,
        minLength: 1,
        zoom: 13,
        marker: false,
        firstTipSubmit: true,
        hideMarkerOnCollapse: true,
      }).on("search:locationfound", function(e) {
        if (cttm_map.hasLayer(marker)) {
          updateMarkerLatLngAfterSearch(e.latlng)
        }
        else{
          // If no marker exist, create one and add it the map
          marker = L.marker(e.latlng, {
            draggable: true,
            icon: myIcon,
          }).addTo(cttm_map);
  
          
        }
        //Change the form latitude and longitude, keeping only 5 decimals
        latinput.value = e.latlng.lat.toFixed(5);
        lnginput.value = e.latlng.lng.toFixed(5);
        
      })
    );
    function updateMarkerLatLngAfterSearch(latlng) {
      //add transition style only on click, we don't want the transition if the user drag&drop the marker.
      marker._icon.style.transition = 'transform 0.3s ease-out';

      marker.setLatLng(latlng);

      //remove transform style after the transition timeout
      setTimeout(function () {
        marker._icon.style.transition = null;
      }, 300);
    }
    //When using the search input of Leaflet.search, "Enter" key was publishing/updating the Wordpress post.
    //This function disable this behaviour when typing in the search input.
    searchinput = document.querySelector('#searchtext9');
    searchinput.addEventListener('keydown', disableEnterKey);
    //On focus, enable zoom with mousewheel on map.
    searchinput.addEventListener(
      'focus',
      function () {
        cttm_map.scrollWheelZoom.enable();
      },
      true
    );

    // Disable enter key on latitude and Longitude input field too, to avoid activating "delete current marker" button
    latinput.addEventListener('keydown', disableEnterKey);
    lnginput.addEventListener('keydown', disableEnterKey);

    function disableEnterKey(e) {
      if (e.keyCode === 13) {
        // 13 is enter
        e.preventDefault();
        if (e.target.id == 'cttm-latfield' || e.target.id == 'cttm-lngfield') {
          e.target.blur();
        }
        return false;
      }
    }

    latinput.addEventListener('change', updateMarkerLatLng);
    lnginput.addEventListener('change', updateMarkerLatLng);

    function updateMarkerLatLng(e) {
      //add transition style only on click, we don't want the transition if the user drag&drop the marker.
      marker._icon.style.transition = 'transform 0.3s ease-out';

      inputlatlng = { lat: latinput.value, lng: lnginput.value };
      marker.setLatLng(inputlatlng);

      //remove transform style after the transition timeout
      setTimeout(function () {
        marker._icon.style.transition = null;
      }, 300);
    }

    /*
	  		Delete current marker information on "delete current marker" button click.
	  	 */
    deletemarkerbtn.addEventListener('click', function () {
      latinput.value = '';
      lnginput.value = '';
      if (cttm_map.hasLayer(marker)) {
        cttm_map.removeLayer(marker);
      }
    });
    /* 
      Custom media upload, must use jQuery.
    */

    jQuery(function ($) {
      // Set all variables to be used in scope
      var frame,
        metaBox = $('#LatLngMarker'),
        addImgLink = metaBox.find('.upload-custom-img'),
        delImgLink = metaBox.find('.delete-custom-img'),
        addImgLinkContainer = metaBox.find('#cttm-custom-thumb-link-container'),
        imgContainer = metaBox.find('#cttm-custom-thumb-container'),
        imgIdInput = metaBox.find('.custom-img-id');

      // ADD IMAGE LINK
      addImgLink.on('click', function (event) {
        event.preventDefault();

        // If the media frame already exists, reopen it.
        if (frame) {
          frame.open();
          return;
        }

        // Create a new media frame
        frame = wp.media({
          multiple: false, // Set to true to allow multiple files to be selected
        });

        // When an image is selected in the media frame...
        frame.on('select', function () {
          // Get media attachment details from the frame state
          var attachment = frame.state().get('selection').first().toJSON();
          
          // Send the attachment URL to our custom image input field.
          imgContainer.prepend(
            '<img src="' +
            attachment.url +
              '" alt="" style="max-width:300px; width:100%;" class="cttm-custom-thumb-el"/>'
          );
          imgContainer.removeClass('hidden');
          // Send the attachment id to our hidden input
          imgIdInput.val(attachment.id);

          // Hide the add image link
          addImgLinkContainer.addClass('hidden');

          // Unhide the remove image link
          delImgLink.removeClass('hidden');
        });

        // Finally, open the modal on click
        frame.open();
      });

      // DELETE IMAGE LINK
      delImgLink.on('click', function (event) {
        event.preventDefault();

        // Clear out the preview image
        imgContainer.find('.cttm-custom-thumb-el').remove();
        imgContainer.addClass('hidden');
        // Un-hide the add image link
        addImgLinkContainer.removeClass('hidden');

        // Hide the delete image link
        delImgLink.addClass('hidden');

        // Delete the image id from the hidden input
        imgIdInput.val('');
      });
    });
  } //END IF document.getElementById("cttm-latfield")!=null

  //If Shortcode Helper page
  if (document.getElementsByClassName('wrap-shortcode-helper').length != 0) {
    /*
	  		Define all default variables.
	  	 */
    var shortcode = document.getElementById('cttm-shortcode-helper');
    var width = '';
    var height = '';
    var maxwidth = '';
    var maxheight = '';
    var minzoom = '';
    var maxzoom = '';
    var thispostsmarker = '';
    var centeredonthis = '';
    var post_id = '';
    var categoriesstring = '';
    var tagsstring = '';
    var posttypestring = '';
    var init_maxzoom = '';
    var custom_tax = '';
    var open_link_in_new_tab = '';
    var disable_clustering = '';
    var tileurl = '';
    var subdomains = '';
    var attribution = '';
    var max_cluster_radius = '';
    var current_query_markers = '';

    /*
	  	Define all Event Listeners on form, so the shortcode is updated each time the user change a form element.
	  */

    // Width Event Listener
    document.getElementById('width').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is default or empty, set width to empty string.
      if (cleanedinput == '100%' || cleanedinput == '') {
        width = '';
      } else {
        // Else, set width variable to output in the shortcode.

        width = ' width=' + cleanedinput;
      }
      //Update shortcode function
      cttmShortcodeUpdate();
    });

    // Height Event Listener
    document.getElementById('height').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is default or empty, set height to empty string.
      if (cleanedinput == '600px' || cleanedinput == '') {
        height = '';
      } else {
        // Else, set height variable to output in the shortcode.

        height = ' height=' + cleanedinput;
      }
      //Update shortcode function
      cttmShortcodeUpdate();
    });

    // Maxwidth Event Listener
    document.getElementById('maxwidth').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is empty, set maxwidth to empty string.
      if (cleanedinput == '') {
        maxwidth = '';
      } else {
        // Else, set maxwidth variable to output in the shortcode.

        maxwidth = ' maxwidth=' + cleanedinput;
      }
      //Update shortcode function
      cttmShortcodeUpdate();
    });

    // Maxheight Event Listener
    document
      .getElementById('maxheight')
      .addEventListener('input', function (e) {
        // Clean every space from the input to avoid shortcode problems.
        cleanedinput = this.value.split(' ').join('');

        // If input is empty, set maxheight to empty string.
        if (cleanedinput == '') {
          maxheight = '';
        } else {
          // Else, set maxheight variable to output in the shortcode.

          maxheight = ' maxheight=' + cleanedinput;
        }

        //Update shortcode function
        cttmShortcodeUpdate();
      });

    // MinZoom Event Listener
    document.getElementById('minzoom').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is empty, set minzoom to empty string.
      if (cleanedinput == '') {
        minzoom = '';
      } else {
        // Else, set minzoom variable to output in the shortcode.

        minzoom = ' minzoom=' + cleanedinput;
      }
      //Update shortcode function
      cttmShortcodeUpdate();
    });

    // MaxZoom Event Listener
    document.getElementById('maxzoom').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is empty, set maxzoom to empty string.
      if (cleanedinput == '') {
        maxzoom = '';
      } else {
        // Else, set maxzoom variable to output in the shortcode.

        maxzoom = ' maxzoom=' + cleanedinput;
      }

      //Update shortcode function
      cttmShortcodeUpdate();
    });

    // Init_Maxzoom Event Listener
    document
      .getElementById('init-maxzoom')
      .addEventListener('input', function (e) {
        // Clean every space from the input to avoid shortcode problems.
        cleanedinput = this.value.split(' ').join('');

        // If input is empty, set maxzoom to empty string.
        if (cleanedinput == '') {
          init_maxzoom = '';
        } else {
          // Else, set maxzoom variable to output in the shortcode.

          init_maxzoom = ' init_maxzoom=' + cleanedinput;
        }

        //Update shortcode function
        cttmShortcodeUpdate();
      });

    // This post's marker only Event Listener
    document
      .getElementById('thispostsmarker')
      .addEventListener('change', function (e) {
        //If checked, set output
        if (this.checked) {
          thispostsmarker = ' this_post=true';
        } else {
          thispostsmarker = '';
        }
        cttmShortcodeUpdate();
      });

    // Centered on this post's marker only Event Listener
    document
      .getElementById('centered_on_this')
      .addEventListener('change', function (e) {
        //If checked, set output
        if (this.checked) {
          centeredonthis = ' centered_on_this=true';
        } else {
          centeredonthis = '';
        }
        cttmShortcodeUpdate();
      });

    // post_id Event Listener
    document.getElementById('post_id').addEventListener('input', function (e) {
      // Clean every space from the input to avoid shortcode problems.
      cleanedinput = this.value.split(' ').join('');

      // If input is empty, set maxzoom to empty string.
      if (cleanedinput == '') {
        post_id = '';
      } else {
        // Else, set maxzoom variable to output in the shortcode.

        post_id = ' post_id=' + cleanedinput;
      }

      //Update shortcode function
      cttmShortcodeUpdate();
    });

    /*
				Categories Event Listener
		 */

    // Get all categories checkboxes
    var catCheckboxes = document.getElementsByClassName('cttm-cat-checkbox');

    // Loop through checkboxes and set Event Listener on change.
    for (var i = 0; i < catCheckboxes.length; i++) {
      catCheckboxes[i].addEventListener('change', function (e) {
        categoriesstring = cttmCheckboxToString(catCheckboxes, 'cats');
        cttmShortcodeUpdate();
      });
    }

    /*
				Tags Event Listener
		 */

    // Get all categories checkboxes
    var tagCheckboxes = document.getElementsByClassName('cttm-tag-checkbox');

    // Loop through checkboxes and set Event Listener on change.
    for (var i = 0; i < tagCheckboxes.length; i++) {
      tagCheckboxes[i].addEventListener('change', function (e) {
        tagsstring = cttmCheckboxToString(tagCheckboxes, 'tags');
        cttmShortcodeUpdate();
      });
    }

    /*
				Post types Event Listener
		 */

    // Get all post types checkboxes
    var posttypeCheckboxes = document.getElementsByClassName(
      'cttm-posttype-checkbox'
    );

    // Loop through checkboxes and set Event Listener on change.
    for (var i = 0; i < posttypeCheckboxes.length; i++) {
      posttypeCheckboxes[i].addEventListener('change', function (e) {
        posttypestring = cttmCheckboxToString(posttypeCheckboxes, 'post_types');
        cttmShortcodeUpdate();
      });
    }
    /*
				Custom Taxonomies Event Listeners
		 */

    // Get all Custom Taxonomies HTML containers
    var customTaxonomiesContainers = document.getElementsByClassName(
      'customtaxonomy'
    );
    var customTaxonomyStrings = {}; // This object will store every custom taxonomy strings
    for (var index = 0; index < customTaxonomiesContainers.length; index++) {
      // Get all Custom Taxonomies names from data-taxonomy-name attribute
      let customTaxonomyName = customTaxonomiesContainers[index].getAttribute(
        'data-taxonomy-name'
      );

      //Get all checkboxes from this taxonomy
      let customTaxonomyCheckboxes = document.getElementsByClassName(
        'cttm-' + customTaxonomyName + '-checkbox'
      );

      // Loop through checkboxes and set Event Listener on change.
      for (var i = 0; i < customTaxonomyCheckboxes.length; i++) {
        customTaxonomyCheckboxes[i].addEventListener('change', function (e) {
          customTaxonomyStrings[customTaxonomyName] = cttmCheckboxToString(
            customTaxonomyCheckboxes,
            customTaxonomyName,
            true
          );
          custom_tax = cttmCustomTaxonomiesStringUpdate();
          cttmShortcodeUpdate();
        });
      }
    }
    // Max Cluster radius Event Listener
    document
      .getElementById('max_cluster_radius')
      .addEventListener('input', function (e) {
        // Clean every space from the input to avoid shortcode problems.
        cleanedinput = this.value.split(' ').join('');

        // If input is empty, set maxClusterRadius to empty string.
        if (cleanedinput == '') {
          max_cluster_radius = '';
        } else {
          // Else, set maxwidth variable to output in the shortcode.

          max_cluster_radius = ' max_cluster_radius=' + cleanedinput;
        }
        //Update shortcode function
        cttmShortcodeUpdate();
      });
    // Disable Clustering marker only Event Listener
    document
      .getElementById('disableclustering')
      .addEventListener('change', function (e) {
        //If checked, set output
        if (this.checked) {
          disable_clustering = ' disable_clustering=true';
        } else {
          disable_clustering = '';
        }
        cttmShortcodeUpdate();
      });
    // Open Link in a new Tab Event Listener
    document
      .getElementById('open_link_in_new_tab')
      .addEventListener('change', function (e) {
        //If checked, set output
        if (this.checked) {
          open_link_in_new_tab = ' open_link_in_new_tab=true';
        } else {
          open_link_in_new_tab = '';
        }
        cttmShortcodeUpdate();
      });

    // This page query markers only Event Listener
    document
      .getElementById('current_query_markers')
      .addEventListener('change', function (e) {
        console.log(this);
        //If checked, set output
        if (this.checked) {
          current_query_markers = ' current_query_markers=true';
        } else {
          current_query_markers = '';
        }
        cttmShortcodeUpdate();
      });

    // Tile Server URL Event Listener
    document.getElementById('tileurl').addEventListener('input', function (e) {
      // If input is default or empty, set width to empty string.
      if (this.value == '') {
        tileurl = '';
      } else {
        // Else, set width variable to output in the shortcode.

        tileurl = ' tileurl="' + this.value + '"';
      }
      //Update shortcode function
      cttmShortcodeUpdate();
    });
    // Subdomains Event Listener
    document
      .getElementById('subdomains')
      .addEventListener('input', function (e) {
        // If input is default or empty, set width to empty string.
        if (this.value == '') {
          subdomains = '';
        } else {
          // Else, set width variable to output in the shortcode.

          subdomains = ' subdomains="' + this.value + '"';
        }
        //Update shortcode function
        cttmShortcodeUpdate();
      });
    // Attribution Event Listener
    document
      .getElementById('attribution')
      .addEventListener('input', function (e) {
        // If input is default or empty, set width to empty string.
        if (this.value == '') {
          attribution = '';
        } else {
          // Else, set width variable to output in the shortcode.

          attribution = " attribution='" + this.value + "'";
        }
        //Update shortcode function
        cttmShortcodeUpdate();
      });

    /*
			// Get all current checkboxes and add the checked ones to a string
			// return the string output for shortcode.
		 */
    function cttmCheckboxToString(checkboxes, type, isCustomTax = false) {
      var firstChecked = true;
      var checkedString = '';
      //Loop through sent checkboxes
      for (var i = 0; i < checkboxes.length; i++) {
        //If current checkbox is checked
        if (checkboxes[i].checked) {
          //If this is the first checked box we get in our loop
          if (firstChecked == true) {
            //Add to string and set firstchecked to false for next value
            checkedString = checkboxes[i].value;
            firstChecked = false;
          } else {
            //If not the first, add this string seaparated by a comma for shortcode
            checkedString = checkedString + ',' + checkboxes[i].value;
          }
        }
      }
      //If we have at least one checked box, set variable to shortcode format.
      if (!firstChecked) {
        //If it's a custom tax, don't add a space before.
        if (isCustomTax == true) {
          checkedString = type + '=' + checkedString;
        } else {
          checkedString = ' ' + type + '=' + checkedString;
        }
      }
      return checkedString;
    }
    /*
		// Get all checked custom taxonomies strings from customTaxonomyStrings object (populated in Custom Taxonomies Event Listeners)
		// and combine them nicely into a variable we return at the end.
		 */
    function cttmCustomTaxonomiesStringUpdate() {
      let customTaxString = ''; //reset our string
      //Loop through each key of our object
      Object.keys(customTaxonomyStrings).forEach(function (item) {
        //If the current item is an empty string (if user uncheck all the terms of a custom tax), don't do anything
        if (customTaxonomyStrings[item] != '') {
          //If first item added, add custom_tax and opening quote
          if (customTaxString === '') {
            customTaxString = ' custom_tax="' + customTaxonomyStrings[item];
          } else {
            // Else (if already an item), separate the items with an ampersand (&)
            customTaxString += '&' + customTaxonomyStrings[item];
          }
        }
      });

      return customTaxString + '"'; //Add closing quote before returning
    }
    /*
			// Get all string variables and add them to shortcode.
		 */
    function cttmShortcodeUpdate() {
      shortcode.innerText =
        '[travelers-map' +
        width +
        maxwidth +
        height +
        maxheight +
        minzoom +
        maxzoom +
        init_maxzoom +
        thispostsmarker +
        centeredonthis +
        post_id +
        categoriesstring +
        tagsstring +
        posttypestring +
        custom_tax +
        max_cluster_radius +
        disable_clustering +
        open_link_in_new_tab +
        current_query_markers +
        tileurl +
        subdomains +
        attribution +
        ']';
    }
  }

  //If it's the plugin's settings page.
  if (
    document.getElementsByClassName('popover-preview-container').length != 0
  ) {
    //get all checkboxes and popover preview image
    checkboxTitle = document.getElementById('cb_title');
    checkboxThumbnail = document.getElementById('cb_thumbnail');
    checkboxDate = document.getElementById('cb_date');
    checkboxExcerpt = document.getElementById('cb_excerpt');
    popoverPreviewImage = document.getElementById('popover-preview-image');

    //Add on click event listeners to all checkbox so we can update the list of checked options
    checkboxTitle.addEventListener('click', updatePopoverPreviewImg);
    checkboxThumbnail.addEventListener('click', updatePopoverPreviewImg);
    checkboxDate.addEventListener('click', updatePopoverPreviewImg);
    checkboxExcerpt.addEventListener('click', updatePopoverPreviewImg);

    updatePopoverPreviewImg();

    /**
     * Get all checkboxes and see if they are checked.
     * Update accordingly the 'imageName' value.
     * If nothing is selected, show nothing.gif, else add .png at the end.
     * Finally, update image src with the image path.
     */
    function updatePopoverPreviewImg() {
      let imagePath = popoverPreviewImage.dataset.path;
      let imageName = '';
      let imageSrc = '';

      if (checkboxTitle.checked) {
        imageName += 'title';
      }
      if (checkboxThumbnail.checked) {
        imageName += 'thumb';
      }
      if (checkboxDate.checked) {
        imageName += 'date';
      }
      if (checkboxExcerpt.checked) {
        imageName += 'excerpt';
      }

      imageName === '' ? (imageName = 'nothing.gif') : (imageName += '.png');

      imageSrc = imagePath + '/' + imageName;
      popoverPreviewImage.src = imageSrc;
    }
  }
});
