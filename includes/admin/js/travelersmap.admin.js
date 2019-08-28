
document.addEventListener("DOMContentLoaded", function(event) { 
	
	//IF it's a post edit page with the plugin initialized. 
	if (document.getElementById("cttm-latfield")!=null) { 
		// Set needed variables
		var iconurl;
		var latinput = document.getElementById("cttm-latfield");
		var lnginput = document.getElementById("cttm-lngfield");
		var deletemarkerbtn = document.getElementById("btn-delete-current-marker");

		// Get all markers input, and loop through each
		var radios = document.getElementById("cttm-markers").querySelectorAll("input[name='marker']");
		for(var i = 0, max = radios.length; i < max; i++) {

			//Get current selected marker icon and
			//create myIcon object for leaflet
			if (radios[i].checked == true){
				iconurl= radios[i].nextElementSibling.currentSrc;
				var imgwidth = radios[i].nextElementSibling.width;
				var imgheight = radios[i].nextElementSibling.height;
		    	var iconAnchor = [parseInt(imgwidth/2),imgheight];
		    	
		    	var myIcon = L.icon({
				    iconUrl: iconurl,
				    iconAnchor: iconAnchor
				});
			}

			//Bind onchange event on radio button
			//Onchange, get new marker icon and
			//change myIcon object
		    radios[i].onchange = function() {
		    	if (this.checked == true) {
		    		
		    		iconurl = this.nextElementSibling.currentSrc;
		    		imgwidth = this.nextElementSibling.width;
		    		imgheight = this.nextElementSibling.height;
		    		iconAnchor = [parseInt(imgwidth/2),imgheight];
		    		myIcon = L.icon({
					    iconUrl: iconurl,
					    iconAnchor: iconAnchor
					});
					//if marker is already displayed on the map, change marker icon 
					if (marker){
							marker.setIcon(myIcon);
					}
				}
		    }
		}
		

		// Init Leaflet
		var cttm_map = L.map('travelersmap-container').setView([45.280712, 5.89], 3); //Zoom 3

		//Disable Scrollwheel zoom when map is not in focus
		cttm_map.scrollWheelZoom.disable();

		//Enable Scrollwheel Zoom on focus
		cttm_map.on('focus', () => { cttm_map.scrollWheelZoom.enable(); });


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
			    [90, 180]
			  ]
		}).addTo(cttm_map);

		//Set marker on map if already chosen
		
		var marker;

		if (latinput.value != "" && lnginput.value != "") {
			marker = L.marker([latinput.value, lnginput.value],{
			        draggable: true,
			        icon: myIcon
			    }).addTo(cttm_map);

				//If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
			    marker.on('dragend', function(e){
			    	latinput.value = e.target._latlng.lat.toFixed(5);
					lnginput.value = e.target._latlng.lng.toFixed(5);
			    });
		}

		//On map click, add a marker or move the existing one to the click location
		cttm_map.on('click', function(e){
			// If a marker already exist
			if (cttm_map.hasLayer(marker)) {

				//add transition style only on click, we don't want the transition if the user drag&drop the marker.
				marker._icon.style.transition = "transform 0.3s ease-out";

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
			else{
				marker = L.marker(e.latlng,{
			        draggable: true,
			        icon: myIcon
			    }).addTo(cttm_map);

				//Change the form latitude and longitude, keeping only 5 decimals
				latinput.value = e.latlng.lat.toFixed(5);
				lnginput.value = e.latlng.lng.toFixed(5);

				//If marker is drag&dropped, change the form latitude and longitude, keeping only 5 decimals
			    marker.on('dragend', function(e){
			    	latinput.value = e.target._latlng.lat.toFixed(5);
					lnginput.value = e.target._latlng.lng.toFixed(5);
			    });
			    
			}
		 return;
		 });

		//add Leaflet.search to the map
		//This is very useful to rapidly find a place
		cttm_map.addControl( new L.Control.Search({
			url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
			jsonpParam: 'json_callback',
			propertyName: 'display_name',
			propertyLoc: ['lat','lon'],
			autoCollapse: true,
			collapsed: false,
			autoType: true,
			minLength: 1,
			zoom: 13,
			firstTipSubmit:true,
			hideMarkerOnCollapse : true
		}) );

	  	//When using the search input of Leaflet.search, "Enter" key was publishing/updating the Wordpress post.
	  	//This function disable this behaviour when typing in the search input.
	  	searchinput = document.querySelector('#searchtext9');
		searchinput.addEventListener('keydown', disableEnterKey);
		//On focus, enable zoom with mousewheel on map.
		searchinput.addEventListener('focus', function () {
			    cttm_map.scrollWheelZoom.enable()
			},true);
	   	
	   	
		
		// Disable enter key on latitude and Longitude input field too, to avoid activating "delete current marker" button  	
		latinput.addEventListener('keydown', disableEnterKey);
		lnginput.addEventListener('keydown', disableEnterKey);

		function disableEnterKey(e) {

		    if (e.keyCode === 13) { // 13 is enter
		     	e.preventDefault();
		     	if (e.target.id == 'cttm-latfield' || e.target.id == 'cttm-lngfield') {
		     		e.target.blur();
		     	}
		     	return false;
	    	};

	    };

	    latinput.addEventListener('change', updateMarkerLatLng);
		lnginput.addEventListener('change', updateMarkerLatLng);

		function updateMarkerLatLng(e) {
			//add transition style only on click, we don't want the transition if the user drag&drop the marker.
			marker._icon.style.transition = "transform 0.3s ease-out";

			inputlatlng = {lat:latinput.value, lng:lnginput.value};
			marker.setLatLng(inputlatlng);
			
			//remove transform style after the transition timeout
				setTimeout(function () {
		            marker._icon.style.transition = null;
		        }, 300);

	    };


	   	/*
	  		Delete current marker information on "delete current marker" button click.
	  	 */
	  	deletemarkerbtn.addEventListener("click", function(){
			latinput.value="";
			lnginput.value="";
			if (cttm_map.hasLayer(marker)){
				cttm_map.removeLayer(marker);
			}
	  	});


  	}//END IF document.getElementById("cttm-latfield")!=null
  	
  	

  	//If Shortcode Helper page
  	if (document.getElementsByClassName('wrap-shortcode-helper').length!=0 ) {
	  	/*
	  		Define all default variables.
	  	 */
	  	var shortcode = document.getElementById("cttm-shortcode-helper");
	  	var width = '';
	  	var height = '';
	  	var maxwidth ='';
	  	var maxheight = '';
	  	var minzoom = '';
	  	var maxzoom = '';
	  	var categoriesstring ='';
	  	var tagsstring = '';
	  	var posttypestring = '';

	  	/*
	  	Define all Event Listeners on form, so the shortcode is updated each time the user change a form element.
	  	 */
	  	
	  	// Width Event Listener
	  	document.getElementById("width").addEventListener('input', function (e) {
	  	
	  	// Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is default or empty, set width to empty string.
		   if (cleanedinput == '100%' || cleanedinput=="") {
		   		
		   		width='';

		   }else{ // Else, set width variable to output in the shortcode.

		   		width= " width=" + cleanedinput;
		   }
		   //Update shortcode function
		   cttmShortcodeUpdate();
			
		});

		// Height Event Listener
		document.getElementById("height").addEventListener('input', function (e) {
		   
		   // Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is default or empty, set height to empty string.
		   if (cleanedinput == '600px' || cleanedinput=="") {

		   		height='';

		   }else{// Else, set height variable to output in the shortcode.

		   	height= " height=" + cleanedinput;
		   	
		   }
		   //Update shortcode function
		   cttmShortcodeUpdate();
			
		});

		// Maxwidth Event Listener
		document.getElementById("maxwidth").addEventListener('input', function (e) {
		   
		   // Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is empty, set maxwidth to empty string.
		   if (cleanedinput == '') {

		   		maxwidth='';
		   
		   }else{// Else, set maxwidth variable to output in the shortcode.

		   	maxwidth= " maxwidth=" + cleanedinput;

		   }
		   //Update shortcode function
		   cttmShortcodeUpdate();
			
		});

		// Maxheight Event Listener
		document.getElementById("maxheight").addEventListener('input', function (e) {
		   
		   // Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is empty, set maxheight to empty string.
		   if (cleanedinput == '') {

		   		maxheight='';
		   
		   }else{// Else, set maxheight variable to output in the shortcode.

		   	maxheight= " maxheight=" + cleanedinput;

		   }

		   //Update shortcode function
		   cttmShortcodeUpdate();
			
		});

		// MinZoom Event Listener
		document.getElementById("minzoom").addEventListener('input', function (e) {
		   
		   // Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is empty, set minzoom to empty string.
		   if (cleanedinput == '') {

		   		minzoom='';
		   
		   }else{// Else, set minzoom variable to output in the shortcode.

		   	minzoom= " minzoom=" + cleanedinput;

		   }
		   //Update shortcode function
		   cttmShortcodeUpdate();
			
		});

		// MaxZoom Event Listener
		document.getElementById("maxzoom").addEventListener('input', function (e) {
		   
		   // Clean every space from the input to avoid shortcode problems.
		   cleanedinput = this.value.split(' ').join('');

		   // If input is empty, set maxzoom to empty string.
		   if (cleanedinput == '') {

		   		maxzoom='';
		   
		   }else{// Else, set maxzoom variable to output in the shortcode.

		   	maxzoom= " maxzoom=" + cleanedinput;

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
		for(var i = 0; i < catCheckboxes.length; i++) {
		    catCheckboxes[i].addEventListener("change", function(e) {
		       	categoriesstring = cttmCheckboxToString(catCheckboxes, "cat");
		       	cttmShortcodeUpdate();
		    });
		}
		
		/*
				Tags Event Listener
		 */
		
		// Get all categories checkboxes
		var tagCheckboxes = document.getElementsByClassName('cttm-tag-checkbox');

		// Loop through checkboxes and set Event Listener on change.
		for(var i = 0; i < tagCheckboxes.length; i++) {
		    tagCheckboxes[i].addEventListener("change", function(e) {
		       	tagsstring = cttmCheckboxToString(tagCheckboxes, "tag");
		       	cttmShortcodeUpdate();
		    });
		}

		/*
				Post types Event Listener
		 */
		
		// Get all post types checkboxes
		var posttypeCheckboxes = document.getElementsByClassName('cttm-posttype-checkbox');

		// Loop through checkboxes and set Event Listener on change.
		for(var i = 0; i < posttypeCheckboxes.length; i++) {
		    posttypeCheckboxes[i].addEventListener("change", function(e) {
		       	posttypestring = cttmCheckboxToString(posttypeCheckboxes, "posttype");
		       	cttmShortcodeUpdate();
		    });
		}
		

		/*
			// Get all current checkboxes and add the checked ones to a string
			// return the string output for shortcode.
		 */
		function cttmCheckboxToString(checkboxes,type){
			
			var firstChecked = true;
			var checkedString = "";

			//Loop through sent checkboxes
			for(var i = 0; i < checkboxes.length; i++) {
				//If current checkbox is checked
				if(checkboxes[i].checked){
					//If this is the first time we get a value
					if (firstChecked==true) {
						//Add to string and set firstchecked to false for next value
						checkedString = checkboxes[i].value;
						firstChecked = false;

					}else{
						//If not the first string, add this string seaparated by a comma for shortcode
						checkedString = checkedString + ',' + checkboxes[i].value;

					}

				}
				
			}
			//If we have a value, set variable to shortcode format depending on type.
			if (!firstChecked) {
					if (type=="cat") {
						checkedString = " cats=" + checkedString;
					}else if(type=="tag"){
						checkedString = " tags=" + checkedString;
					}else if(type=="posttype"){
						checkedString = " post_types=" +checkedString;
					}
			};
			
			return checkedString;

		}

		/*
			// Get all string variables and add them to shortcode.
		 */
		function cttmShortcodeUpdate(){
			shortcode.innerText = '[travelers-map' + width + maxwidth + height + maxheight + minzoom + maxzoom + categoriesstring + tagsstring + posttypestring +']'; 
		}

	}  	
});
