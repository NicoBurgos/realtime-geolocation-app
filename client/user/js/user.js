const socket = io()

// Custom icons
const homeIcon = L.icon({
	iconUrl: '/img/home.png',
	iconSize: [35, 35],
})
const truckIcon = L.icon({
	iconUrl: 'img/truck.png',
	iconSize: [35, 35],
})

// Initialize coords
let homeCoords = {}
let truckCoords = {}

// Initialize map with default view
const map = L.map('map').setView([-24.1878, -65.2995], 15)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution:
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	tileSize: 512,
	zoomOffset: -1,
}).addTo(map)

// Initialize markers
const homeMarker = L.marker({}, { icon: homeIcon, draggable: true }).bindPopup(
	'Home'
)
const truckMarker = L.marker({}, { icon: truckIcon }).bindPopup('Truck')

// Initialize routing control
const routingControl = L.Routing.control({
	waypoints: [],
	routeWhileDragging: false,
	show: false,
	addWaypoints: false,
	createMarker: function () {
		return null
	},
}).addTo(map)

// Set up event listeners
// map.locate gets the current location in order to activate the onLocationFound function
map.locate({ setView: true, maxZoom: 16 })
map.on('locationfound', onLocationFound)
map.on('locationerror', onLocationError)
socket.on('emit location', updateTruckLocation)
socket.on('truck-disconnected', handleTruckDisconnection)

// Function to update home marker
function updateHomeMarker(coords) {
	homeMarker.setLatLng(coords).addTo(map)
	homeMarker.on('dragend', function (e) {
		homeCoords = homeMarker.getLatLng()
		if (truckCoords) {
			updateRoute(truckCoords, homeCoords)
		}
	})
}

// Function to update truck location
function updateTruckLocation(coords) {
	truckCoords = { lat: coords.lat, lng: coords.lng }
	updateTruckMarker(truckCoords)
	if (homeCoords) {
		updateRoute(truckCoords, homeCoords)
	}
}

// Function to update truck marker
function updateTruckMarker(coords) {
	truckMarker.setLatLng(coords).addTo(map)
}

// Function to update route
function updateRoute(start, end) {
	routingControl.setWaypoints([
		L.latLng(start.lat, start.lng),
		L.latLng(end.lat, end.lng),
	])
	routingControl.on('routesfound', function (e) {
		e.routes.splice(1)
	})
}

// Function to handle location found
function onLocationFound(e) {
	homeCoords = e.latlng
	updateHomeMarker(homeCoords)
	if (truckCoords) {
		updateRoute(truckCoords, homeCoords)
	}
}

// Function to handle location error
function onLocationError(e) {
	alert(e.message)
}

function handleTruckDisconnection() {
	// Reset truck coords
	truckCoords = {}
	// Remove the truck marker
	map.removeLayer(truckMarker)
	// Reset the waypoints
	routingControl.setWaypoints([])
}

// Button click event
const button = document.getElementById('button')
button.addEventListener('click', () => handleButtonClick())

// Function to handle button click
function handleButtonClick() {
	// Set home coordinates
	homeCoords = { lat: -24.1878, lng: -65.2995 }
	updateHomeMarker(homeCoords)
	map.flyTo(homeCoords, 16)
	if (truckCoords) {
		updateRoute(truckCoords, homeCoords)
	}
}
