document.addEventListener("DOMContentLoaded", function(event) { 
	
	
	/**
	 * Create leaflet map object "cttm_map"
	 */

	var cttm_map = L.map('travelersmap-container') ;//Zoom 3
	
	/**
	 * Disable Scrollwheel zoom when map is not in focus
	 */
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
		attribution: cttm_options['attribution']
	
		}).addTo(cttm_map);
	 

	/**
   	* Create all markers and popups, and add them to the leaflet map.
   	*/
   
	//Create a Leaftlet Cluster Group, so we can add our markers in it
		var markerscluster = L.markerClusterGroup({
			spiderfyOnMaxZoom: false,
			showCoverageOnHover: false,
			maxClusterRadius: 45
		});

	//Get markers metas and linked posts datas from shortcode
	var json_cttm_metas = php_params.cttm_metas;
	
	//If posts with markers exist
	if (json_cttm_metas!=0){
		//Clean json string to be usable
		json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '"');
		
		//Get an array of objects containing markerdatas and postdatas
		cttm_metas = JSON.parse(json_cttm_metas);
		
		//Loop through cttm_metas array, create all the markers and popups.
	    for (var i = 0; i < cttm_metas.length; i++) {
	    	
	    	//Get markerdatas object
	        var markerdatas = JSON.parse(cttm_metas[i].markerdatas);
			
	        //Initialize all markers variables
	        var markerlatitude = markerdatas.latitude;
	        var markerlongitude = markerdatas.longitude;
	        var markerURL = markerdatas.markerdata[0];
	        var markerwidth = markerdatas.markerdata[1];
	        var markerheight = markerdatas.markerdata[2];

	        //Get linked postdatas object
	        var postdatas = cttm_metas[i].postdatas;
	        
	        //Initialize all linked posts variables for popups
	        var postthumb = postdatas.thumb;

	        var posturl = postdatas.url;
	        var posttitle = postdatas.thetitle;

	        // Create a leaflet icon object and add it to the map, use default
	        if (markerURL!="d") {
	        	var myIcon = L.icon({
				    iconUrl: markerURL,
				    iconSize: [markerwidth, markerheight],
				    iconAnchor: [markerwidth/2, markerheight],
				    popupAnchor: [0, -markerheight+3]
				});
				//Create actual marker object wih our custom icon
				var marker = L.marker( [markerlatitude, markerlongitude], {
					icon: myIcon
				});

	        }else{
	        	//Create actual marker object with default icon
				
				var marker = L.marker( [markerlatitude, markerlongitude]);
				
	        }
	        

			//Create HMTL markup for popups and bind it to our freshly created marker
			var output = '<div class="img-mask">';
			if (postthumb) {
	        	output += '<img src="'+postthumb+'" alt="">';
	        }else{
	        	output += '<div class="nothumbplaceholder"></div>';
	        }
			
			output += '</div><a class="tooltip-link" href="'+posturl+'">';
			output += '<div class="title">'+posttitle+'</div></a>';

			//add the marker in our cluster group layer with its popup
	        markerscluster.addLayer(marker.bindPopup(output));

	    } //ENF For Loop through cttm_metas 

	   
	    //add markercluster layer to the map
	  	cttm_map.addLayer(markerscluster);

	  	cttm_map.fitBounds(markerscluster.getBounds(),{
	  		maxZoom:13,
	  		padding: [60,60]
	  	});
	  	//Get all markers on the map
	  

	} //END if (!json_cttm_metas)

	
	
	
});


