function switchRankingTab(tab) {
            currentRankingTab = tab;
            document.getElementById('btnRankRain').classList.toggle('active', tab === 'rain');
            document.getElementById('btnRankTemp').classList.toggle('active', tab === 'temp');
            document.getElementById('btnRankLowTemp').classList.toggle('active', tab === 'lowTemp');
            document.getElementById('btnRankWindGust').classList.toggle('active', tab === 'windGust');
            renderRankings();
        }

function renderRankings() {
            const container = document.getElementById('rankingCardsContainer');
            if (!container || weatherStationData.length === 0) return;

            let parsedList = weatherStationData.map(station => {
                const data = parseStationElement(station);
                const county = (station.GeoInfo?.CountyName || '').replace('台', '臺');
                const town = station.GeoInfo?.TownName || '';
                return {
                    stationId: station.StationId,
                    stationName: station.StationName,
                    county: county,
                    town: town,
                    temp: data.temp,
                    rain: data.rain,
                    elevation: data.elevation,
                    windSpeed: data.windSpeed,
                    windGust: data.windGust
                };
            });

            if (currentRankingTab === 'rain') {
                parsedList.sort((a, b) => b.rain - a.rain);
                let top10 = parsedList.slice(0, 10);

                if (top10.length === 0 || top10[0].rain === 0) {
                    container.innerHTML = `<div class="my-location-status" style="grid-column: span 2;">目前全台各測站無顯著降雨累積。</div>`;
                    return;
                }

                let html = '';
                top10.forEach((item, index) => {
                    html += `
                        <div class="ranking-card" data-station-id="${item.stationId}" title="點擊檢視此測站儀表板">
                            <div class="ranking-card-top">
                                <span class="ranking-station-name">${item.stationName} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${item.county}</span></span>
                                <span class="ranking-badge-num">#${index + 1}</span>
                            </div>
                            <div class="ranking-main-value">${item.rain.toFixed(1)}<span style="font-size: 14px; font-weight: 600; margin-left: 2px;">mm</span></div>
                            <div class="ranking-sub-info">
                                <i class="fas fa-cloud-rain"></i> 區域：${item.county}${item.town}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

            } else if (currentRankingTab === 'temp') {
                let validTempList = parsedList.filter(item => !isNaN(item.temp));
                validTempList.sort((a, b) => b.temp - a.temp);
                let top10 = validTempList.slice(0, 10);

                if (top10.length === 0) {
                    container.innerHTML = `<div class="my-location-status" style="grid-column: span 2;">目前無有效氣溫資料。</div>`;
                    return;
                }

                let html = '';
                top10.forEach((item, index) => {
                    html += `
                        <div class="ranking-card" data-station-id="${item.stationId}" title="點擊檢視此測站儀表板">
                            <div class="ranking-card-top">
                                <span class="ranking-station-name">${item.stationName} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${item.county}</span></span>
                                <span class="ranking-badge-num">#${index + 1}</span>
                            </div>
                            <div class="ranking-main-value" style="color: #f59e0b;">${item.temp.toFixed(1)}<span style="font-size: 14px; font-weight: 600; margin-left: 2px;">°C</span></div>
                            <div class="ranking-sub-info" style="color: #38bdf8;">
                                <i class="fas fa-map-marker-alt"></i> 區域：${item.county}${item.town}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

            } else if (currentRankingTab === 'lowTemp') {
                let validList = parsedList.filter(item => {
                    if (isNaN(item.temp)) return false;
                    const name = item.stationName;
                    if (name.includes('玉山') || name.includes('合歡') || name.includes('雪山') || name.includes('阿里山') || name.includes('太平山') || name.includes('向陽') || name.includes('南橫')) {
                        return false;
                    }
                    if (item.elevation > 500) return false;
                    return true;
                });

                validList.sort((a, b) => a.temp - b.temp);
                let top10 = validList.slice(0, 10);

                if (top10.length === 0) {
                    container.innerHTML = `<div class="my-location-status" style="grid-column: span 2;">目前無符合條件的低溫資料。</div>`;
                    return;
                }

                let html = '';
                top10.forEach((item, index) => {
                    html += `
                        <div class="ranking-card" data-station-id="${item.stationId}" title="點擊檢視此測站儀表板">
                            <div class="ranking-card-top">
                                <span class="ranking-station-name">${item.stationName} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${item.county}</span></span>
                                <span class="ranking-badge-num">#${index + 1}</span>
                            </div>
                            <div class="ranking-main-value" style="color: #38bdf8;">${item.temp.toFixed(1)}<span style="font-size: 14px; font-weight: 600; margin-left: 2px;">°C</span></div>
                            <div class="ranking-sub-info" style="color: #34d399;">
                                <i class="fas fa-snowflake"></i> 低溫排行：${item.county}${item.town}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

            } else if (currentRankingTab === 'windGust') {
                let validList = parsedList.filter(item => !isNaN(item.windGust) && item.windGust >= 0);
                validList.sort((a, b) => b.windGust - a.windGust);
                let top10 = validList.slice(0, 10);

                if (top10.length === 0) {
                    container.innerHTML = `<div class="my-location-status" style="grid-column: span 2;">目前無有效陣風資料。</div>`;
                    return;
                }

                let html = '';
                top10.forEach((item, index) => {
                    html += `
                        <div class="ranking-card" data-station-id="${item.stationId}" title="點擊檢視此測站儀表板">
                            <div class="ranking-card-top">
                                <span class="ranking-station-name">${item.stationName} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${item.county}</span></span>
                                <span class="ranking-badge-num">#${index + 1}</span>
                            </div>
                            <div class="ranking-main-value" style="color: #a855f7;">${Math.round(item.windGust)}<span style="font-size: 14px; font-weight: 600; margin-left: 2px;">m/s</span> <span style="font-size: 12px; font-weight: normal; color: var(--text-muted);">(${getWindLevel(item.windGust)})</span></div>
                            <div class="ranking-sub-info" style="color: #a855f7;">
                                <i class="fas fa-wind"></i> 區域：${item.county}${item.town}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        }

function selectStationById(stationId) {
            const targetStation = weatherStationData.find(s => s.StationId === stationId);
            if (!targetStation) return;

            let county = (targetStation.GeoInfo?.CountyName || '').replace('台', '臺');
            const isFreeway = isFreewayStation(targetStation.StationName);
            
            setStationType(isFreeway ? 'freeway' : 'normal');

            const citySelect = document.getElementById('citySelect');
            citySelect.value = county;
            updateStationOptions();

            const stationSelect = document.getElementById('stationSelect');
            stationSelect.value = stationId;

            renderCurrentStationData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
