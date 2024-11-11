let map;
let marker;
let autocomplete;
let service;
let infowindow;
let markers = [];  // Array to hold markers

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map-container"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default location (San Francisco)
        zoom: 13,
    });
    
    // Initialize the Places Service
    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();

    // Initialize Autocomplete on the location input field
    const input = document.getElementById("location-input");
    const autocomplete = new google.maps.places.Autocomplete(input);

    // When a place is selected from the autocomplete, update the map center
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            map.setCenter(place.geometry.location);
        } else {
            alert("Please select a valid location from the list.");
        }
    });
}


// Main function to get recommendations based on user preferences
function getRecommendations() {
    const locationInput = document.getElementById('location-input').value;
    const placeType = document.getElementById('place-type').value;
    const preference = document.getElementById('preference').value;

    if (!locationInput) {
        alert('Please enter a location.');
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationInput }, (results, status) => {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            map.setCenter(location);

            // Map preferences to valid Google Places types
            const preferenceTypes = {
                fun: ['amusement_park', 'theatre'],
                adventure: ['park', 'view point'],
                religious: ['church','temple'],
                historic: 'museum'
            };

            // Use selected placeType if no preference is specified, else use preference type
            const selectedType = preferenceTypes[preference] || placeType;

            const request = {
                location: location,
                radius: 5000,
                type: [selectedType]  // Use the selected type based on preference or placeType
            };

            service.nearbySearch(request, (places, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    document.getElementById('map-section').style.display = 'block';

                    // Clear existing markers before adding new ones
                    clearMarkers();

                    places.forEach((place) => {
                        const marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            title: place.name
                        });
                        markers.push(marker);

                        google.maps.event.addListener(marker, 'click', () => {
                            infowindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity}`);
                            infowindow.open(map, marker);
                        });
                    });

                    // Adjust the map bounds to fit the results
                    const bounds = new google.maps.LatLngBounds();
                    places.forEach((place) => {
                        bounds.extend(place.geometry.location);
                    });
                    map.fitBounds(bounds);
                } else {
                    alert('No places found for the selected preference.');
                }
            });
        } else {
            alert('Geocode was unsuccessful for the following reason: ' + status);
        }
    });
}

// Function to clear existing markers on the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));  // Remove each marker from the map
    markers = [];  // Reset the markers array
}
