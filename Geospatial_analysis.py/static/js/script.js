let map, geeLayer, userMarker;
let lastLoadedDataset = null;
let isLoading = false;

function initMap() {
    map = L.map('map', {
        zoomControl: false
    }).setView([36.1699, -115.1398], 11);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add event listeners
    map.on('moveend', function() {
        if (lastLoadedDataset) {
            loadDataset(lastLoadedDataset);
        }
    });

    map.on('mousemove', function(e) {
        document.getElementById('coordinates').textContent = 
            `Lat: ${e.latlng.lat.toFixed(4)}, Lon: ${e.latlng.lng.toFixed(4)}`;
    });

    // Try to get user's location on page load
    useIPLocation();
}

function showError(message, duration = 3000) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, duration);
}

function showLoading() {
    if (!isLoading) {
        isLoading = true;
        document.getElementById('loading').style.display = 'block';
    }
}

function hideLoading() {
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}

async function useIPLocation() {
    showLoading();
    try {
        const response = await fetch('/get_ip_location');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        const lat = data.latitude;
        const lon = data.longitude;

        if (lat && lon) {
            map.setView([lat, lon], 11);
            if (userMarker) {
                userMarker.setLatLng([lat, lon]);
            } else {
                userMarker = L.marker([lat, lon]).addTo(map);
            }
        } else {
            throw new Error('Invalid location data');
        }
    } catch (error) {
        showError('Could not determine location. Using default location.');
        console.error('Location error:', error);
    } finally {
        hideLoading();
    }
}

function useManualLocation() {
    const input = document.getElementById('manual-location').value;
    const coords = input.split(',').map(coord => parseFloat(coord.trim()));
    
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        map.setView(coords, 11);
        if (userMarker) {
            userMarker.setLatLng(coords);
        } else {
            userMarker = L.marker(coords).addTo(map);
        }
    } else {
        showError('Invalid coordinates format. Use format: latitude,longitude');
    }
}

async function loadDataset(dataset) {
    if (isLoading) return;
    
    showLoading();
    lastLoadedDataset = dataset;
    
    try {
        const bounds = map.getBounds();
        const response = await fetch('/get_gee_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataset: dataset,
                bounds: [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ],
                zoom: map.getZoom()
            }),
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (geeLayer) {
            map.removeLayer(geeLayer);
        }

        geeLayer = L.tileLayer(data.tile_url).addTo(map);
        
    } catch (error) {
        showError(`Error loading dataset: ${error.message}`);
        console.error('Dataset error:', error);
    } finally {
        hideLoading();
    }
}


// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', initMap);

// Existing script content remains...

async function calculateLandslideRisk() {
    showLoading();
    try {
        const bounds = map.getBounds();
        const response = await fetch('/calculate_landslide_risk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bounds: [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to calculate landslide risk');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (geeLayer) {
            map.removeLayer(geeLayer);
        }
        
        geeLayer = L.tileLayer(data.risk_image).addTo(map);
        displayRiskResults('Landslide', data.summary);
        
    } catch (error) {
        showError(`Landslide Risk Error: ${error.message}`);
        console.error('Landslide risk calculation error:', error);
    } finally {
        hideLoading();
    }
}

async function calculateFloodRisk() {
    showLoading();
    try {
        const bounds = map.getBounds();
        const response = await fetch('/calculate_flood_risk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bounds: [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to calculate flood risk');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (geeLayer) {
            map.removeLayer(geeLayer);
        }
        
        geeLayer = L.tileLayer(data.risk_image).addTo(map);
        displayRiskResults('Flood', data.summary);
        
    } catch (error) {
        showError(`Flood Risk Error: ${error.message}`);
        console.error('Flood risk calculation error:', error);
    } finally {
        hideLoading();
    }
}

function displayRiskResults(type, summary) {
    const resultsPanel = document.getElementById('risk-results');
    const summaryDiv = document.getElementById('risk-summary');
    
    if (!summary) {
        showError(`No ${type.toLowerCase()} risk data available`);
        return;
    }
    
    resultsPanel.style.display = 'block';
    summaryDiv.innerHTML = `
        <h3>${type} Risk Analysis</h3>
        <p>Low Risk: ${summary.low_risk}%</p>
        <p>Moderate Risk: ${summary.moderate_risk}%</p>
        <p>High Risk: ${summary.high_risk}%</p>
    `;
}

function showError(message, duration = 5000) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, duration);
}
