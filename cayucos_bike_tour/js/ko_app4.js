( function () {
    'use strict';
    var map; // instance of google.maps.Map object
    var defaultCenter = { lat: 35.449, lng: -120.9 }; // Cayucos, CA
    var searchData = ko.observableArray ( [] ); // recommendations or user search
    var Markers = {}; // container to keep track of markers, used by removeMarker()
    var searchType = ko.observable (); // getRecommendations() 4|| userSearch()
    var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?q=Cayucos,CA,USA&appid=7565e04fc20a00898d327571f10232ae&units=imperial';


    /**
      * Use jQuery to make asychronous call to opeweathermap.org.
      * @param {string} weatherURL : 'http://api.openweathermap.org/data/2.5/weather?q=Cayucos,CA,USA&appid=7565e04fc20a00898d327571f10232ae&units=imperial'
      * @parm {function} packageWeather callback, builds weatherData object
      */
    var $wd = $.getJSON ( weatherURL, packageWeather );
    var weatherData = ko.observable (); // weather data observable, updated by packageWeather


    /**
      * Creates new object of weather data.
      * @param {object} data async returned from http://openweathermap.org
      * stores object in weatherData ()
      */
    function packageWeather ( data ) {
        var now = new Date ();

        var direction = data.wind.deg; // wind direction in degrees
        // switch on direction to convert from degrees to North, South, East or West
        switch ( direction ) {
            case ( direction >= 45 && direction < 135 ):
                direction = 'East';
                break;
            case ( direction >= 135 && direction < 225 ):
                direction = 'South';
                break;
            case ( direction >= 225 && direction < 315 ):
                direction = 'West';
                break;
            default:
                direction = 'North';
                break;
        }

        // build new weatherData object
        var newData = {
            // datetime :  now.toDateString () + ', ' + now.toLocaleTimeString (),
            datetime :  now.toDateString (),
            cityName : data.name,
            skies : data.weather [ 0 ].description,
            wind : 'wind : ' + Math.round ( data.wind.speed ) + ' mph from the ' + direction,
            temp : Math.round ( data.main.temp ) + '˚',
            humidity : 'humidity : ' + data.main.humidity + '%',
        };

        weatherData ( newData );
        console.log ( weatherData () );
    }


    /**
      * Creates new map.
      * @param {object} mapOptions {
      *       zoom: 15,
      *      center: defaultCenter,
      *      mapTypeControl: true,
      *      mapTypeControlOptions: {
      *          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
      *      },
      *      zoomControl: true,
      *      zoomControlOptions: {
      *          style: google.maps.ZoomControlStyle.SMALL,
      *      },
      * };
      */
    function buildMap ( mapOptions ) {
            map = new google.maps.Map ( document.getElementById ( 'map-canvas' ), mapOptions );
            var bikeLayer = new google.maps.BicyclingLayer();
            bikeLayer.setMap( map );
    }


    /**
      * Change center of current map
      * @param {object} location is a LatLng object representing a geographic point.
      * basic form is { k: 35.44922, D: -120.905685 }
      * k is latitude specified in degrees within the range [-90, 90].
      * D is longitude specified in degrees within the range [-180, 180].
      */
    function updateCenter ( location ) {
        var center = map.getCenter ();
        if (location && location  !== center ) {
            map.setCenter ( location );
        } else {
            map.setCenter ( defaultCenter );
        }
    }


    /**
      * Initiates async search for businesses within 5 Km of center of Cayucos, CA using google.maps.places.PlacesService.nearbySearch.
      *  When async call returns, callback handles returned data.
      */
    function getRecommendations () {
        var request = {
            location: defaultCenter,
            radius: 5000,
        };
        var service = new google.maps.places.PlacesService ( map );
        service.nearbySearch ( request, callback );
        map.setCenter ( defaultCenter );
        searchType ( 'Recommendations' );
    }


    /**
      * Initiates async search for businesses within 5 Km of center of Cayucos, CA usinggoogle.maps.places.PlacesService.textSearch.
      *  @param {string} q user entered search string
      *  When async call returns, callback handles returned data.
      */
    function userSearch ( q ) {
        var request = {
            query : q,
            location : map.getCenter (),
            radius: 10000
        };
        var service = new google.maps.places.PlacesService ( map );
        service.textSearch ( request, callback );
        searchType ( 'Search' );
    }


    /**
      * Gets information of place from google.maps.places.PlacesService.getDetails
      * @param {object} place place object from google.maps.places.PlacesService
      * either textSearch or nearbySearch
      * uses place infomation to build details object
      * attaches details ko observable to place in searchData observable
      * updates place in searchData(), passing details object to details observable
      */
    function getPlaceDetails ( place ) {
        var service = new google.maps.places.PlacesService ( map );
        service.getDetails( { placeId: place.place_id }, function ( placeInfo, status ) {
            if ( status == google.maps.places.PlacesServiceStatus.OK ) {

                var details = {
                    address : placeInfo.formatted_address,
                    phone : placeInfo.formatted_phone_number,
                    location : place.geometry.location
                };
                var reviews = 'number of reviews : ';
                placeInfo.reviews ? reviews += placeInfo.reviews.length : reviews += 'none';

                if ( placeInfo.website ) {
                    details.website = '<a href =' + placeInfo.website + '>' + placeInfo.website + '</a>';
                } else {
                    details.website = null;
                }
                details.reviews = reviews;
                var i = searchData.indexOf ( place );
                searchData ()[ i ].details ( details );
            }
        } );
    }


    /**
      * Adds google marker with click event listener to map.
      * @param {object} place place object from google.maps.places.PlacesService
      * either textSearch or nearbySearch
      * Click event changes the marker icon and set streetview to marker.position ( === place location )
      */
    function addMarker ( place ) {
        var marker = new google.maps.Marker (
            {
            position : place.geometry.location,
            title : place.name,
            map : map,
            }
        );
        google.maps.event.addListener ( marker, "click", function () {
            addPano ( marker.position );
            marker.setIcon ( 'images/Flag_icon.svg' ); // https://en.wikipedia.org/wiki/File:Flag_icon.svg
            }
        );
        Markers [ place.id ] = marker; // keep track of marker to remove it later
    }


    /**
      * Remove place marker and streetview from map.
      * Called by ViewModel.clicked when place is clicked in search list a second time.
      * @param {object} place place object from google.maps.places.PlacesService
      * either textSearch or nearbySearch
      */
    function removeMarker ( place ) {
        Markers [ place.id ].setMap ( null );
        Markers [ place.id ].setIcon ( null );
    }


    /**
      * Add street view to map.
      * Called by ViewModel.clicked when place is clicked in search list
      * @param {object} location is a LatLng object representing a geographic point.
      * basic form is { k: 35.44922, D: -120.905685 }
      * k is latitude specified in degrees within the range [-90, 90].
      * D is longitude specified in degrees within the range [-180, 180].
      */
    function addPano ( location ) {
        var panoOptions = {
            position: location,
            addressControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER
                },
            linksControl: false,
            panControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            enableCloseButton: false
        };
        var panorama = new google.maps.StreetViewPanorama ( document.getElementById ( 'pano' ), panoOptions );
    }


    /**
      * Create search list of places when userSearch() or getRecommendations() returns
      * @param {object} results object from google.maps.places.PlacesService
      * either textSearch or nearbySearch
      * @param {string} status "OK" or "not OK "
      * @param {object} pagination  Object {
      *    k: R/<(), j: callback(), H: "CvQB4gA..."," hasNextPage: true },
      *   or Object {
      *    k: R/<(), j: callback(), H: undefined, D: 1427157510013, hasNextPage: false }
      *  Disables or enables more button based on hasNextPage.
      */
    function callback ( results, status, pagination ) {
        if ( status != google.maps.places.PlacesServiceStatus.OK ) {
            console.log ( 'not OK ' );
        } else {
            for ( var i = 0; i < results.length; i++ ) results [ i ].details = ko.observable ();
            searchType () === 'Recommendations' ? searchData ( results.slice ( 2 ) ) : searchData ( results );
            if ( pagination.hasNextPage ) {
                var moreButton = document.getElementById ( 'more' );
                moreButton.disabled = false;
                google.maps.event.addDomListenerOnce ( moreButton, 'click',
                    function () {
                        moreButton.disabled = true;
                        pagination.nextPage();
                    }
                );
            }
        }
    }


    /**
      * Sets up default mapOptions object.
      * Calls buildMap with mapOptions.
      * Calls getRecommendations to build default search list.
      */
    function initialize () {
        var mapOptions = {
            zoom: 15,
            center: defaultCenter,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
            },
        };

        buildMap ( mapOptions );
        getRecommendations ();
    }


    /**
      * Checks google API is loaded.
      * If true, calls to kick off map building process;
      * if false, loggs to the console.
      */
    if ( typeof google !== 'undefined' ) {
        google.maps.event.addDomListener ( window, 'load', initialize );
    } else {
        console.log ( "I don't know no google." );
    }


    /**
      * Handles communication between model and Knockout event bindings in the DOM.
      */
    var ViewModel = function () {
        var self = this;
        self.weather = weatherData;
        self.data =  searchData;
        self.searchType = searchType;
        self.shouldShowPano = ko.observable ( false ); // street view not visible by default
        self.searchString = ko.observable ( '' ); // from input


        /**
          *  Switches street view to clicked place by calling addPano with data.location.
          *  Called by Knockout when street view button is clicked.
          *  Available only when place details are showing.
          *  @param {object} data searchData Object {
          *  address: "",
          *  phone: "",
          *  location: Object,
          *  website: "<a href =http://www.example.com/>http://www.example.com/</a>",
          *  reviews: "number of reviews : 3"
          *  }
          */
        self.showStreetView = function ( data ) {
            self.shouldShowPano ( true );
            addPano ( data.location );
        };


        /**
          *  Process search input.
          *  @param {object} data searchData Object {
          *  address: "",
          *  phone: "",
          *  location: Object,
          *  website: "<a href =http://www.example.com/>http://www.example.com/</a>",
          *  reviews: "number of reviews : 3"
          *  }
          *  @param {object} event jQuery event object
          *  If enter key ( event.keyCode === 13 ) pressed in search field, search with search string in search field.
          *  If search string is empty string, call getRecommendations, resetting to default state
          *  and remove street view from screen.
          */
        self.search = function ( data, event ) {
            console.log ( data );
            if ( event.keyCode === 13 ) {
                // self.searchString () === '' ? getRecommendations () : userSearch ( self.searchString () );
                if ( self.searchString () === '' ) {
                    getRecommendations ();
                    self.shouldShowPano ( false );
                } else {
                    userSearch ( self.searchString () );
                }
            }
            return true;
        };


        /**
          *  Process click input.
          *  @param {object} data searchData Object {
          *  address: "",
          *  phone: "",
          *  location: Object,
          *  website: "<a href =http://www.example.com/>http://www.example.com/</a>",
          *  reviews: "number of reviews : 3"
          *  }
          *  @param {object} event jQuery event object
          *  Determins if event has a class name.
          *  If true:
          *    removes class, deletes details from place in self.data, removes marker from map, removes street view panorama.
          *  If false:
          *    recenters map on clicked place location, adds class 'clicked',
          *    gets place details and updates self.data, adds place marker to map,
          *    adds nearest street view image to map, makes street view visible.
          */
        self.clicked = function ( data, event ) {
            var details = true;
            var i = self.data.indexOf ( data ); // get index of clicked place in self.data

            if ( event.target.className ) { // if already had a class
                event.target.className = '';
                self.data () [ i ].details ( null );
                removeMarker ( data );
                self.shouldShowPano ( false );

            } else {
                updateCenter ( data.geometry.location );
                event.target.className = 'clicked';
                getPlaceDetails ( data );
                addMarker ( data );
                addPano ( data.geometry.location );
                self.shouldShowPano ( true );
            }
        };

        return true;
    };

    ko.applyBindings ( new ViewModel  () );

} ) ();
