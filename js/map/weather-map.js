function initMap() {
            if (mapInitialized) return;
            map = L.map('map', { 
                zoomControl: false,
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: 'bottomright'
                }
            }).setView([23.5, 121.0], 8);
            
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-eGP, and the GIS User Community',
                maxZoom: 18
            }).addTo(map);

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 18
            }).addTo(map);

            map.addLayer(currentMarkersLayer);

            const LegendControl = L.Control.extend({
                options: { position: 'bottomleft' },
                onAdd: function (map) {
                    const div = L.DomUtil.create('div', 'custom-vertical-legend');
                    div.id = 'verticalLegendBox';
                    return div;
                }
            });
            legendControl = new LegendControl().addTo(map);

            mapInitialized = true;
            updateMapLegendUI(currentMapMode);
            renderMapMarkers();
        }

function switchMapMode(mode) {
            currentMapMode = mode;
            ['temp', 'pop', 'rain', 'wind', 'windGust'].forEach(m => {
                const btn = document.getElementById(`btnMap${m.charAt(0).toUpperCase() + m.slice(1)}`);
                if (btn) btn.classList.toggle('active', m === mode);
            });
            updateMapLegendUI(mode);
            if (mapInitialized) renderMapMarkers();
        }

function updateMapLegendUI(mode) {
            const legendBox = document.getElementById('verticalLegendBox');
            if (!legendBox) return;

            if (mode === 'rain') {
                legendBox.innerHTML = `
                    <div class="legend-header-title">日雨量 (mm)</div>
                    <div class="legend-scale-body">
                        <div class="legend-color-bar-rain" style="min-height: 220px;"></div>
                        <div class="legend-labels-list">
                            <span>300</span><span>200</span><span>150</span><span>130</span><span>110</span><span>90</span><span>70</span><span>50</span><span>40</span><span>30</span><span>20</span><span>15</span><span>10</span><span>6</span><span>2</span><span>1</span>
                        </div>
                    </div>
                `;
            } else if (mode === 'pop') {
                legendBox.innerHTML = `
                    <div class="legend-header-title">降雨機率 (%)</div>
                    <div class="legend-scale-body">
                        <div class="legend-color-bar-rain" style="background: linear-gradient(to top, #94a3b8 0%, #38bdf8 30%, #0284c7 60%, #2563eb 85%, #7c3aed 100%); min-height: 160px;"></div>
                        <div class="legend-labels-list">
                            <span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
                        </div>
                    </div>
                `;
            } else if (mode === 'temp') {
                legendBox.innerHTML = `
                    <div class="legend-header-title">氣溫 (°C)</div>
                    <div class="legend-scale-body">
                        <div class="legend-color-bar-rain" style="background: linear-gradient(to top, #003366, #3366CC, #33CCCC, #33CC33, #FFCC00, #FF6600, #FF0000, #990099); min-height: 180px;"></div>
                        <div class="legend-labels-list">
                            <span>38+</span><span>35</span><span>30</span><span>25</span><span>20</span><span>15</span><span>10</span><span>&lt;10</span>
                        </div>
                    </div>
                `;
            } else if (mode === 'wind' || mode === 'windGust') {
                legendBox.innerHTML = `
                    <div class="legend-header-title">${mode === 'wind' ? '風速' : '陣風'} (m/s)</div>
                    <div class="legend-scale-body">
                        <div class="legend-color-bar-rain" style="background: linear-gradient(to top, #71717a, #3b82f6, #10b981, #facc15, #f97316, #ef4444, #a855f7, #ec4899); min-height: 200px;"></div>
                        <div class="legend-labels-list">
                            <span>42+</span><span>37</span><span>33</span><span>29</span><span>25</span><span>21</span><span>17</span><span>14</span><span>11</span><span>8</span><span>6</span><span>3</span><span>2</span><span>0</span>
                        </div>
                    </div>
                `;
            }
        }

function getRainColor(rain) {
            if (rain >= 300) return '#FF66FF';
            if (rain >= 200) return '#660066';
            if (rain >= 150) return '#990099';
            if (rain >= 130) return '#990000';
            if (rain >= 110) return '#CC0000';
            if (rain >= 90) return '#FF0000';
            if (rain >= 70) return '#FF6600';
            if (rain >= 50) return '#FF9900';
            if (rain >= 40) return '#FFCC00';
            if (rain >= 30) return '#FFFF00';
            if (rain >= 20) return '#009900';
            if (rain >= 15) return '#00CC00';
            if (rain >= 10) return '#0000CC';
            if (rain >= 6) return '#0066FF';
            if (rain >= 2) return '#00CCFF';
            if (rain >= 1) return '#99FFFF';
            return '#C0C0C0';
        }

function getPopColor(pop) {
            if (pop >= 80) return '#7c3aed';
            if (pop >= 70) return '#2563eb';
            if (pop >= 50) return '#0284c7';
            if (pop >= 30) return '#0ea5e9';
            if (pop >= 10) return '#38bdf8';
            return '#94a3b8';
        }

function getTempColor(temp) {
            if (temp >= 38) return '#990099';
            if (temp >= 35) return '#FF0000';
            if (temp >= 30) return '#FF6600';
            if (temp >= 25) return '#FFCC00';
            if (temp >= 20) return '#33CC33';
            if (temp >= 15) return '#33CCCC';
            if (temp >= 10) return '#3366CC';
            return '#003366';
        }

function getWindColor(speed) {
            if (speed >= 41.5) return '#ec4899';
            if (speed >= 32.7) return '#a855f7';
            if (speed >= 24.5) return '#ef4444';
            if (speed >= 17.2) return '#f97316';
            if (speed >= 10.8) return '#facc15';
            if (speed >= 5.5) return '#10b981';
            if (speed >= 1.6) return '#3b82f6';
            return '#71717a';
        }

function renderMapMarkers() {
            if (!currentMarkersLayer) return;
            currentMarkersLayer.clearLayers();

            weatherStationData.forEach(station => {
                const lat = parseFloat(station.GeoInfo?.Coordinates?.[1]?.StationLatitude || station.Latitude);
                const lon = parseFloat(station.GeoInfo?.Coordinates?.[1]?.StationLongitude || station.Longitude);
                if (isNaN(lat) || isNaN(lon)) return;

                const data = parseStationElement(station);
                const county = (station.GeoInfo?.CountyName || '').replace('台', '臺');
                const town = station.GeoInfo?.TownName || '';
                const popVal = getPopForStation(county, town);

                let val, bgColor, displayVal;
                if (currentMapMode === 'rain') {
                    val = data.rain;
                    bgColor = getRainColor(val);
                    displayVal = Math.round(val);
                } else if (currentMapMode === 'pop') {
                    val = popVal;
                    bgColor = getPopColor(val);
                    displayVal = popVal;
                } else if (currentMapMode === 'temp') {
                    val = data.temp;
                    bgColor = getTempColor(val);
                    if (isNaN(val)) {
                        displayVal = '--';
                    } else {
                        displayVal = val.toFixed(1);
                    }
                } else if (currentMapMode === 'wind') {
                    val = data.windSpeed;
                    bgColor = getWindColor(val);
                    displayVal = Math.round(val);
                } else {
                    val = data.windGust;
                    bgColor = getWindColor(val);
                    displayVal = Math.round(val);
                }

                let centerTextColor = '#fff';
                if (currentMapMode === 'temp' && val >= 20 && val < 30) centerTextColor = '#0f172a';
                else if (currentMapMode === 'rain' && val >= 30 && val < 50) centerTextColor = '#0f172a';
                else if (currentMapMode === 'pop' && val < 40) centerTextColor = '#0f172a';

                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="weather-dot-badge" style="background-color: ${bgColor}; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${centerTextColor}; width: 30px; height: 30px; font-size: 9px;">${displayVal}</div>`
                });

                const marker = L.marker([lat, lon], { icon: customIcon });

                const popupContent = `
                    <div class="popup-card">
                        <h4>${station.StationName} <span style="font-size: 12px; color: var(--popup-sub);">(${county}${town})</span></h4>
                        <p>🌡️ 氣溫：<b>${!isNaN(data.temp) ? data.temp.toFixed(1) + ' °C' : '-- °C'}</b></p>
                        <p>🌧️ 日雨量：<b>${data.rain.toFixed(1)} mm</b></p>
                        <p>☂️ 降雨機率：<b>${popVal} %</b></p>
                        <p>💨 風向風速：<b>${getWindDirectionText(data.windDir)} ${Math.round(data.windSpeed)} m/s (${getWindLevel(data.windSpeed)})</b></p>
                        <p>🌪️ 陣風：<b>${Math.round(data.windGust)} m/s (${getWindLevel(data.windGust)})</b></p>
                        <p>💧 相對濕度：<b>${data.humidity !== '--' ? data.humidity + ' %' : '-- %'}</b></p>
                        <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">觀測時間：${formatObsTime(data.obsTime)}</p>
                    </div>
                `;

                marker.bindPopup(popupContent);
                currentMarkersLayer.addLayer(marker);
            });
        }
