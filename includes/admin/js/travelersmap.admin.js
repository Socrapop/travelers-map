document.addEventListener('DOMContentLoaded', function (event) {
  //IF it's a post edit page with the plugin initialized.

  if (document.getElementById('LatLngMarker') != null) {
    var popoverCustomizerOpeners = document.querySelectorAll(
      '.customize-popover-title'
    );
    popoverCustomizerOpeners.forEach((element) => {
      element.onclick = (e) => {
        //récupère le bloc à afficher
        let customizerContainer = e.target.parentElement;
        //Toggle class .is-open
        if (customizerContainer.classList.contains('is-open')) {
          customizerContainer.classList.remove('is-open');
        } else {
          customizerContainer.classList.add('is-open');
        }
      };
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

    /**
     * Init leaflet
     */

    //Attach leaflet map object to the window object, to be accessible globally
    window.cttm_map = L.map('travelersmap-container').setView(
      [45.280712, 5.89],
      3 //Zoom 3
    );
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

    observeGutenbergAccordion();
    /**
     * Set global variables
     */

    //interface elements variables
    var deletemarkerbtn = document.querySelectorAll('.cttm-delete-marker');

    var addAnotherMarkerButton = document.getElementById(
      'btn-add-another-marker'
    );

    //Get all markers containers at load time
    var markerContainers;
    var numberOfMarkers;
    updateNumberOfMarkers();

    //handle selected marker behavior (click on the map)
    var currentSelectedMarkerID;
    var currentSelectedMarkerContainer;

    // set icons and markers array
    var iconsList = [];
    var markersList = [];

    addAnotherMarkerButton.onclick = function (e) {
      const lastContainer = markerContainers[numberOfMarkers - 1];
      const newId = numberOfMarkers;
      const containerToClone = document.querySelector(
        '#form-copy-multimarker .col-markers-container'
      );
      let clonedContainerHTML = containerToClone.innerHTML;
      clonedContainerHTML = clonedContainerHTML.replace(
        /ReplaceWithID/g,
        newId
      );
      clonedContainerHTML = clonedContainerHTML.replace(
        /RemoveWhenCopied/g,
        ''
      );
      const newContainer = document.createElement('div');
      newContainer.className = 'col-markers-container';
      newContainer.dataset.markerNumber = newId;
      newContainer.innerHTML = clonedContainerHTML;
      lastContainer.insertAdjacentElement('afterend', newContainer);
      //Update all data attributes and values
      const newRadios = newContainer.querySelectorAll('.cttm-markers input');

      // Get selected marker radio element
      // create myIcon object for leaflet
      // Add it to iconsList array.
      let checkedRadio = document.querySelector(
        "input[name='marker[" + newId + "]']:checked"
      );
      let iconurl = checkedRadio.nextElementSibling.currentSrc;
      let imgwidth = checkedRadio.nextElementSibling.width;
      let imgheight = checkedRadio.nextElementSibling.height;
      let iconAnchor = [parseInt(imgwidth / 2), imgheight];
      let myIcon = L.icon({
        iconUrl: iconurl,
        iconAnchor: iconAnchor,
      });

      iconsList.push(myIcon);

      //Bind all events on the new container
      initJqueryCustomMediaUpload();

      newRadios.forEach((radio) => {
        radio.onchange = function (e) {
          if (this.checked == true) {
            let iconurl = this.nextElementSibling.currentSrc;
            let imgwidth = this.nextElementSibling.width;
            let imgheight = this.nextElementSibling.height;
            let iconAnchor = [parseInt(imgwidth / 2), imgheight];
            let myIcon = L.icon({
              iconUrl: iconurl,
              iconAnchor: iconAnchor,
            });
            iconsList[newId] = myIcon;
            //if marker is already displayed on the map, change marker icon
            if (markersList[newId]) {
              markersList[newId].setIcon(myIcon);
              refreshSelectedMarker(newId);
            }
          }
        };
      });

      newContainer.addEventListener('click', function () {
        refreshSelectedMarker(this.dataset.markerNumber);
      });

      // Select current marker container
      refreshSelectedMarker(newId);

      updateNumberOfMarkers();

      const popoverCustomizerOpeners = newContainer.querySelector(
        '.customize-popover-title'
      );
      popoverCustomizerOpeners.onclick = (e) => {
        //récupère le bloc à afficher
        let customizerContainer = e.target.parentElement;
        //Toggle class .is-open
        if (customizerContainer.classList.contains('is-open')) {
          customizerContainer.classList.remove('is-open');
        } else {
          customizerContainer.classList.add('is-open');
        }
      };
      const deletebtn = newContainer.querySelector('.cttm-delete-marker');
      deletebtn.addEventListener('click', function (e) {
        let buttonID = e.target.id.charAt(e.target.id.length - 1);
        const LatInput = document.querySelector(
          'input#cttm-latfield-' + buttonID
        );
        const LongInput = document.querySelector(
          'input#cttm-longitude-' + buttonID
        );
        LatInput.value = '';
        LongInput.value = '';
        if (cttm_map.hasLayer(markersList[buttonID])) {
          cttm_map.removeLayer(markersList[buttonID]);
          markersList[buttonID].wasDeleted = true;
        }

        if (parseInt(buttonID) !== 0) {
          const container = e.target.parentElement;
          container.classList.add('is-deleted');
          setTimeout(() => {
            refreshSelectedMarker(0);
          }, 1);
        }
        updateNumberOfMarkers();
      });
    };

    //LOOP through each markers at load time
    // >> Create a marker layer for each in an array
    // >> Get radios inputs  and create icon Object
    // >> Bind these radios input the onchange to change current marker layer
    for (let index = 0; index < numberOfMarkers; index++) {
      // Get selected marker radio element
      // create myIcon object for leaflet
      // Add it to iconsList array.
      let checkedRadio = document.querySelector(
        "input[name='marker[" + index + "]']:checked"
      );

      let iconurl = checkedRadio.nextElementSibling.currentSrc;
      let imgwidth = checkedRadio.nextElementSibling.width;
      let imgheight = checkedRadio.nextElementSibling.height;
      let iconAnchor = [parseInt(imgwidth / 2), imgheight];
      let myIcon = L.icon({
        iconUrl: iconurl,
        iconAnchor: iconAnchor,
      });

      iconsList.push(myIcon);

      // Get all markers inputs of current index marker
      let radios = document.querySelectorAll(
        "input[name='marker[" + index + "]']"
      );

      //Bind onchange event on all radio buttons:
      // - Get new marker icon and change myIcon object.
      // - Set currentSelectedMarker to the current input ID.
      radios.forEach((radio) => {
        radio.onchange = function (e) {
          if (this.checked == true) {
            let iconurl = this.nextElementSibling.currentSrc;
            let imgwidth = this.nextElementSibling.width;
            let imgheight = this.nextElementSibling.height;
            let iconAnchor = [parseInt(imgwidth / 2), imgheight];
            let myIcon = L.icon({
              iconUrl: iconurl,
              iconAnchor: iconAnchor,
            });
            iconsList[index] = myIcon;
            //if marker is already displayed on the map, change marker icon
            if (markersList[index]) {
              markersList[index].setIcon(myIcon);
              refreshSelectedMarker(index);
            }
          }
        };
      });

      // If already set on init, add marker to the map
      // then add on drag event,
      // then push to markersList array so we can access it easily after with index number
      let newMarker;
      let currentLatInput = document.querySelector(
        'input#cttm-latfield-' + index
      );
      let currentLongInput = document.querySelector(
        'input#cttm-longitude-' + index
      );
      if (currentLatInput.value != '' && currentLongInput.value != '') {
        newMarker = L.marker([currentLatInput.value, currentLongInput.value], {
          draggable: true,
          icon: myIcon,
        }).addTo(cttm_map);
        cttm_map.setView([currentLatInput.value, currentLongInput.value]);
        //If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
        newMarker.on('dragend', function (e) {
          refreshSelectedMarker(index);
          currentLatInput.value = e.target._latlng.lat.toFixed(5);
          currentLongInput.value = e.target._latlng.lng.toFixed(5);
        });
        markersList.push(newMarker);
      }
    } // END LOOP MARKERS

    //Set selectedMarker on init
    refreshSelectedMarker(0); // by default, set the first marker as selected.
    markerContainers.forEach((container) => {
      container.addEventListener('click', function () {
        refreshSelectedMarker(parseInt(this.dataset.markerNumber));
      });
    });
    //Change view to fit all markers on init if multiple markers
    if (markersList.length > 1) {
      const markersBounds = new L.featureGroup(markersList).getBounds();
      cttm_map.fitBounds(markersBounds, { padding: [60, 60] });
    }
    //InvalidateSize after 100ms for map resize issue in gutenberg
    setTimeout(function () {
      cttm_map.invalidateSize();
    }, 100);

    //Disable Scrollwheel zoom when map is not in focus
    cttm_map.scrollWheelZoom.disable();

    //Enable Scrollwheel Zoom on focus
    cttm_map.on('focus', () => {
      cttm_map.scrollWheelZoom.enable();
    });

    //On map click, add a marker or move the existing one to the click location
    cttm_map.on('click', function (e) {
      let hasChangedSelectedMarker = false;
      markersList.forEach((marker, index) => {
        if (
          e.originalEvent.target == marker._icon &&
          currentSelectedMarkerID != index
        ) {
          refreshSelectedMarker(index);
          hasChangedSelectedMarker = true;
        }
      });
      if (hasChangedSelectedMarker == false) {
        // If a marker already exist or was deleted
        if (
          markersList[currentSelectedMarkerID] &&
          !markersList[currentSelectedMarkerID].wasDeleted
        ) {
          //add transition style only on click, we don't want the transition if the user drag&drop the marker.
          markersList[currentSelectedMarkerID]._icon.style.transition =
            'transform 0.3s ease-out';

          // set new latitude and longitude
          markersList[currentSelectedMarkerID].setLatLng(e.latlng);

          //remove transform style after the transition timeout
          setTimeout(function () {
            markersList[currentSelectedMarkerID]._icon.style.transition = null;
          }, 300);
          //Change the form latitude and longitude, keeping only 5 decimals

          let currentLatInput = document.querySelector(
            'input#cttm-latfield-' + currentSelectedMarkerID
          );
          let currentLongInput = document.querySelector(
            'input#cttm-longitude-' + currentSelectedMarkerID
          );
          currentLatInput.value = e.latlng.lat.toFixed(5);
          currentLongInput.value = e.latlng.lng.toFixed(5);
        }
        // If no marker exist, create one and add it the map
        else {
          markersList[currentSelectedMarkerID] = L.marker(e.latlng, {
            draggable: true,
            icon: iconsList[currentSelectedMarkerID],
          }).addTo(cttm_map);

          //Change the form latitude and longitude, keeping only 5 decimals
          let currentLatInput = document.querySelector(
            'input#cttm-latfield-' + currentSelectedMarkerID
          );
          let currentLongInput = document.querySelector(
            'input#cttm-longitude-' + currentSelectedMarkerID
          );
          currentLatInput.value = e.latlng.lat.toFixed(5);
          currentLongInput.value = e.latlng.lng.toFixed(5);
          refreshSelectedMarker(currentSelectedMarkerID);

          //If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
          markersList[currentSelectedMarkerID].on('dragend', function (e) {
            markersList.forEach((marker, index) => {
              if (
                e.sourceTarget._element == marker._icon &&
                currentSelectedMarkerID != index
              ) {
                refreshSelectedMarker(index);
              }
            });
            let currentLatInput = document.querySelector(
              'input#cttm-latfield-' + currentSelectedMarkerID
            );
            let currentLongInput = document.querySelector(
              'input#cttm-longitude-' + currentSelectedMarkerID
            );
            currentLatInput.value = e.target._latlng.lat.toFixed(5);
            currentLongInput.value = e.target._latlng.lng.toFixed(5);
          });
        }
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
      }).on('search:locationfound', function (e) {
        if (cttm_map.hasLayer(markersList[currentSelectedMarkerID])) {
          updateMarkerLatLngAfterSearch(
            markersList[currentSelectedMarkerID],
            e.latlng
          );
        } else {
          // If no marker exist, create one and add it the map
          markersList[currentSelectedMarkerID] = L.marker(e.latlng, {
            draggable: true,
            icon: iconsList[currentSelectedMarkerID],
          }).addTo(cttm_map);
        }
        //Change the form latitude and longitude, keeping only 5 decimals
        let currentLatInput = document.querySelector(
          'input#cttm-latfield-' + currentSelectedMarkerID
        );
        let currentLongInput = document.querySelector(
          'input#cttm-longitude-' + currentSelectedMarkerID
        );
        currentLatInput.value = e.latlng.lat.toFixed(5);
        currentLongInput.value = e.latlng.lng.toFixed(5);
      })
    );
    function updateMarkerLatLngAfterSearch(marker, latlng) {
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
    let allLatInputs = document.querySelectorAll('input[name="latitude[]"]');
    let allLongInput = document.querySelectorAll('input[name="longitude[]"]');
    allLatInputs.forEach((input) => {
      input.addEventListener('keydown', disableEnterKey);
    });

    allLongInput.forEach((input) => {
      input.addEventListener('keydown', disableEnterKey);
    });

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

    allLatInputs.forEach((input) => {
      input.addEventListener('change', updateMarkerLatLng);
    });
    allLongInput.forEach((input) => {
      input.addEventListener('change', updateMarkerLatLng);
    });

    function updateMarkerLatLng(e) {
      let inputID = e.target.id.charAt(e.target.id.length - 1);
      //add transition style only on click, we don't want the transition if the user drag&drop the marker.
      refreshSelectedMarker(inputID);
      markersList[currentSelectedMarkerID]._icon.style.transition =
        'transform 0.3s ease-out';

      let currentLatInput = document.querySelector(
        'input#cttm-latfield-' + currentSelectedMarkerID
      );
      let currentLongInput = document.querySelector(
        'input#cttm-longitude-' + currentSelectedMarkerID
      );

      inputlatlng = { lat: currentLatInput.value, lng: currentLongInput.value };
      markersList[currentSelectedMarkerID].setLatLng(inputlatlng);

      //remove transform style after the transition timeout
      setTimeout(function () {
        markersList[currentSelectedMarkerID]._icon.style.transition = null;
      }, 300);
    }

    /*
        Delete current marker information on "delete current marker" button click.
       */

    deletemarkerbtn.forEach((button) => {
      button.addEventListener('click', function (e) {
        let buttonID = e.target.id.charAt(e.target.id.length - 1);
        let LatInput = document.querySelector(
          'input#cttm-latfield-' + buttonID
        );
        let LongInput = document.querySelector(
          'input#cttm-longitude-' + buttonID
        );
        LatInput.value = '';
        LongInput.value = '';
        if (cttm_map.hasLayer(markersList[buttonID])) {
          cttm_map.removeLayer(markersList[buttonID]);
          markersList[buttonID].wasDeleted = true;
        }
        if (parseInt(buttonID) !== 0) {
          const container = e.target.parentElement;
          container.classList.add('is-deleted');
          setTimeout(() => {
            refreshSelectedMarker(0);
          }, 1);
          updateNumberOfMarkers();
        }
      });
    });

    initJqueryCustomMediaUpload();

    function initJqueryCustomMediaUpload() {
      /* 
      Custom media upload, must use jQuery.
    */

      jQuery(function ($) {
        // Set all variables to be used in scope
        var metaboxes = $('.col-markers-container');

        metaboxes.each(function () {
          var frame,
            addImgLink = $(this).find('.upload-custom-img'),
            delImgLink = $(this).find('.delete-custom-img'),
            addImgLinkContainer = $(this).find(
              '.cttm-custom-thumb-link-container'
            ),
            imgContainer = $(this).find('.cttm-custom-thumb-container'),
            imgIdInput = $(this).find('.custom-img-id');

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
      }); //Custom media upload
    }
    function updateNumberOfMarkers() {
      // Update numberOfMarkers variable
      markerContainers = document.querySelectorAll(
        '.row-markers-edit .col-markers-container[data-marker-number]'
      );
      numberOfMarkers = markerContainers.length;

      // Enable delete button on first marker if it's the only marker.

      const visibleMarkerContainers = document.querySelectorAll(
        '.row-markers-edit .col-markers-container[data-marker-number]:not(.is-deleted)'
      );
      const firstDeleteButton = document.querySelector(
        '#btn-delete-current-marker-0'
      );
      if (visibleMarkerContainers.length == 1) {
        firstDeleteButton.disabled = false;
      } else {
        firstDeleteButton.disabled = true;
      }
    }

    function refreshSelectedMarker(ID) {
      //Remove/add "active" class  on container
      markerContainers.forEach((markerContainer, index) => {
        if (index == ID) {
          markerContainer.classList.add('active');
        } else {
          markerContainer.classList.remove('active');
        }
      });
      currentSelectedMarkerID = ID;
      currentSelectedMarkerContainer = getMarkerContainer(
        currentSelectedMarkerID
      );
      if (markersList.length > 1) {
        markersList.forEach((marker, index) => {
          if (marker._icon != null) {
            if (index == ID) {
              marker._icon.classList.remove('inactive');
              marker._icon.classList.add('active');
              cttm_map.flyTo(marker.getLatLng());
            } else {
              marker._icon.classList.add('inactive');
              marker._icon.classList.remove('active');
            }
          }
        });
      }
    }
    function getMarkerContainer(ID) {
      return document.querySelector(
        '.col-markers-container[data-marker-number="' + ID + '"]'
      );
    }
    /**
     * Observe gutenberg accordion containing Travelers' map editing box.
     * When opened, resize the map to avoid tiles and markers misplaced on the map.
     */
    function observeGutenbergAccordion() {
      const mapContainer = document.getElementById('LatLngMarker');

      const observer = new MutationObserver(function callback(mutationsList) {
        for (let mutation of mutationsList) {
          if (!mutation.target.classList.contains('closed') && cttm_map) {
            cttm_map.invalidateSize();

            if (markersList.length > 0) {
              markersList.forEach((marker) => {
                const markerHeight = marker._icon.height;
                const markerWidth = marker._icon.width;
                const iconAnchor = [parseInt(markerWidth / 2), markerHeight];
                const markerIcon = marker.getIcon();
                markerIcon.options.iconAnchor = iconAnchor;
                marker.setIcon(markerIcon);
              });
            }
            const markersBounds = new L.featureGroup(markersList).getBounds();
            cttm_map.fitBounds(markersBounds, { padding: [60, 60] });
          }
        }
      });

      observer.observe(mapContainer, { attributes: true });
    }
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
    var customTaxonomiesContainers =
      document.getElementsByClassName('customtaxonomy');
    var customTaxonomyStrings = {}; // This object will store every custom taxonomy strings
    for (var index = 0; index < customTaxonomiesContainers.length; index++) {
      // Get all Custom Taxonomies names from data-taxonomy-name attribute
      let customTaxonomyName =
        customTaxonomiesContainers[index].getAttribute('data-taxonomy-name');

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

  // Create event to listen to know when the map is loaded.
  // Useful if you want to add a leaflet plugin to your maps or to interact with the map.
  let event_cttm = document.createEvent('Event');

  // Define that the event name is 'cttm_map_loaded'.
  event_cttm.initEvent('cttm_map_loaded', true, true);

  // target can be any Element or other EventTarget.
  document.dispatchEvent(event_cttm);
});
