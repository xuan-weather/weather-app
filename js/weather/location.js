function initUserLocationWeather() {
            const container = document.getElementById('myLocationContentArea');

            if (weatherStationData.length === 0) {
                container.innerHTML = `<div class="my-location-status"><i class="fas fa-exclamation-circle" style="color: #f87171;"></i> 正在載入氣象測站資料庫，請稍後...</div>`;
                return;
            }

            if (!navigator.geolocation) {
                container.innerHTML = `<div class="my-location-status"><i class="fas fa-ban" style="color: #f87171;"></i> 您的瀏覽器不支援地理定位功能。</div>`;
                return;
            }

            container.innerHTML = `<div class="my-location-status"><i class="fas fa-spinner fa-spin"></i> 正在取得您的 GPS 定位與氣象資料...</div>`;

            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    
                    let closestStation = null;
                    let minDistance = Infinity;

                    weatherStationData.forEach(station => {
                        const lat = parseFloat(station.GeoInfo?.Coordinates?.[1]?.StationLatitude || station.Latitude);
                        const lon = parseFloat(station.GeoInfo?.Coordinates?.[1]?.StationLongitude || station.Longitude);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            const dist = calculateDistance(userLat, userLon, lat, lon);
                            if (dist < minDistance) {
                                minDistance = dist;
                                closestStation = station;
                            }
                        }
                    });

                    if (closestStation) {
                        const data = parseStationElement(closestStation);
                        const county = (closestStation.GeoInfo?.CountyName || '').replace('台', '臺');
                        const town = closestStation.GeoInfo?.TownName || '';
                        const popVal = getPopForStation(county, town);
                        const weatherCond = determineWeatherCondition(data.rain, data.humidity, popVal);

                        container.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 28px;">${weatherCond.icon}</div>
                                    <div>
                                        <div style="font-size: 15px; font-weight: 700; color: var(--text-color);">
                                            ${closestStation.StationName} <span style="font-size: 12px; color: #38bdf8; font-weight: normal;">(${county}${town})</span>
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                                            距離約 ${minDistance.toFixed(1)} 公里 | 觀測時間：${formatObsTime(data.obsTime)}
                                        </div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 20px; font-weight: 700; color: #38bdf8;">
                                        ${!isNaN(data.temp) ? data.temp.toFixed(1) + ' °C' : '-- °C'}
                                    </div>
                                    <div style="font-size: 12px; color: #38bdf8; margin-top: 2px;">
                                        降雨機率: ${popVal} %
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--panel-border); padding-top: 8px;">
                                <div>💨 風速/陣風：<b>${getWindDirectionText(data.windDir)} ${Math.round(data.windSpeed)} m/s (${getWindLevel(data.windSpeed)}) / 陣風 ${Math.round(data.windGust)} m/s (${getWindLevel(data.windGust)})</b></div>
                                <div>💧 相對濕度：<b>${data.humidity !== '--' ? data.humidity + ' %' : '-- %'}</b></div>
                                <div style="grid-column: span 2;">🌧️ 日累積雨量：<b>${data.rain.toFixed(1)} mm</b></div>
                            </div>
                        `;
                    } else {
                        container.innerHTML = `<div class="my-location-status"><i class="fas fa-exclamation-triangle"></i> 找不到鄰近的測站資料。</div>`;
                    }
                },
                error => {
                    container.innerHTML = `<div class="my-location-status" style="color: #f87171;"><i class="fas fa-map-marker-slash"></i> 無法取得 GPS 定位，請確認瀏覽器定位權限。</div>`;
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        }
