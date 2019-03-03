var markers = [];
var map;
var autocomplete;
var street;
function onDragEnd(){
    street.setPosition(this.position)
    console.log(this.position)
}
function onMouseOver(){
    console.log("Mouse Over: ", this.position)
}
function onPlaceChanged(){
    var place = autocomplete.getPlace();
    if(place.geometry){
        loc = place.geometry.location
        map.panTo(place.geometry.location);
        map.setZoom(14);
        var marker = new google.maps.Marker({'position': {lat: loc.lat(), lng: loc.lng()}, 'map':map, 'animation': google.maps.Animation.DROP, 'draggable': true})
        marker.addListener('dragend', onDragEnd);
        marker.addListener('mouseover', onMouseOver);
        markers.push(marker)
        street.setPosition(loc)
    }
}
function initMap() {
    var loc = {lat: 38.81695, lng: -77.16785};
    map = new google.maps.Map(document.getElementById('map'), {zoom: 14, center: loc});
    var marker = new google.maps.Marker({'position': loc, 'map': map, 'animation': google.maps.Animation.DROP, 'draggable': true})
    marker.addListener('dragend', onDragEnd);
    marker.addListener('mouseover', onMouseOver);
    markers.push(marker)
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'),{});
    autocomplete.addListener('place_changed', onPlaceChanged);
    street = new google.maps.StreetViewPanorama(
      document.getElementById('street'), {
        position: loc,
      });
}

initMap()