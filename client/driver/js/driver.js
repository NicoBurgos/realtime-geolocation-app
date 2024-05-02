const socket = io()

//Custom icon
const truckIcon = L.icon({
	iconUrl: 'img/truck.png',
	iconSize: [35, 35],
})

//Initialize coords
let truckCoords = {}

// Initialize map with default view
let map = L.map('map').setView([-24.1878, -65.2995], 15)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution:
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	tileSize: 512,
	zoomOffset: -1,
}).addTo(map)

// Initialize marker
let truckMarker = L.marker([0, 0], { icon: truckIcon, draggable: true })
	.addTo(map)
	.bindPopup('Truck')

//Get coords when location found
function onLocationFound(e) {
	if (e.latlng.lat == truckCoords.lat && e.latlng.lng == truckCoords.lng) return

	truckCoords = e.latlng
	//Update marker coords
	truckMarker.setLatLng(truckCoords).addTo(map)
	map.flyTo(truckCoords, 16)
	//emit coords with socket
	emitCoords()

	//Allow drag marker and update coords
	truckMarker.on('dragend', function () {
		truckCoords = truckMarker.getLatLng()
		truckMarker.setLatLng(truckCoords).addTo(map)
		//emit coords with socket
		socket.emit('location', truckCoords)
	})
}

function onLocationError(e) {
	alert(e.message)
}

function emitCoords() {
	socket.emit('location', truckCoords)
}

function trackLocation() {
	//map.locate gets the current location in order to activate the onLocationFound function
	map.locate({ setView: true, maxZoom: 16 })
}

map.on('locationfound', onLocationFound)
map.on('locationerror', onLocationError)

//trackLocation() //delete when the interval is activated
//Update location every 5 seconds
setInterval(trackLocation, 5000)
