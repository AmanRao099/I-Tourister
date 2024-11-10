let map;
let marker;
let autocomplete;

function initMap() {
    // Create a map centered on a default location (e.g., New York City)
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to New York City
        zoom: 12
    });

    // Create an autocomplete input for location search
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('location-input'));
    autocomplete.setFields(['address_component', 'geometry']); // Restrict results to necessary fields

    // Add listener to handle place selection
    autocomplete.addListener('place_changed', function () {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat: lat, lng: lng });
            marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map
            });
        }
    });
}

function getRecommendations() {
    const location = document.getElementById('location-input').value;

    if (location === "") {
        alert("Please enter a valid location.");
        return;
    }

    // Show the map and make a request to Google Places API for tourist spots
    document.getElementById('map-section').style.display = "block";

    // Use the Google Places API to search for tourist spots in the entered location
    const request = {
        query: location + " tourist attractions",
        fields: ['name', 'geometry', 'place_id']
    };

    const service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Clear existing markers
            clearMarkers();

            // Loop through the results and place a marker on the map
            results.forEach(function (place) {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name
                });

                const infowindow = new google.maps.InfoWindow();
                marker.addListener('click', function () {
                    infowindow.setContent(place.name);
                    infowindow.open(map, marker);
                });
            });

            // Adjust the map bounds to fit the results
            const bounds = new google.maps.LatLngBounds();
            results.forEach(function (place) {
                bounds.extend(place.geometry.location);
            });
            map.fitBounds(bounds);
        } else {
            alert("No tourist spots found for the given location.");
        }
    });
}

// Function to clear existing markers on the map
function clearMarkers() {
    const markers = map.markers || [];
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    map.markers = [];
}
