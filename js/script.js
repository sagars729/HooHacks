var markers = [];
var map;
var autocomplete;
var street;
var snapmap = document.getElementById('snap')
function onDragEnd(){
    street.setPosition(this.position)
    snapmap.src = "https://map.snapchat.com/embed/1551588780046/@" + this.position.lat() + "," + this.position.lng();
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
        snapmap.src = "https://map.snapchat.com/embed/1551588780046/@" + this.position.lat() + "," + this.position.lng();
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