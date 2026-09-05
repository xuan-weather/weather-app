async function fetchAllStationData(isManualRefresh = false, callback = null) {
            const btn = document.getElementById('refreshBtn');
            if (btn && isManualRefresh) btn.classList.add('spinning');

            const nonce = Date.now();
            const url1 = `https://mingxuan.904037.xyz/api/v1/rest/datastore/O-A0001-001?_=${nonce}`;
            const url2 = `https://mingxuan.904037.xyz/api/v1/rest/datastore/O-A0003-001?_=${nonce}`;
            const url4 = `https://mingxuan.904037.xyz/api/v1/rest/datastore/W-C0033-001?_=${nonce}`;
            const urlPop = `https://mingxuan.904037.xyz/api/v1/rest/datastore/F-C0032-001?_=${nonce}`;

            try {
                const [res1, res2, res4, resPop] = await Promise.all([
                    fetch(url1, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { Station: [] } })),
                    fetch(url2, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { Station: [] } })),
                    fetch(url4, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { location: [] } })),
                    fetch(urlPop, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { dataset: { location: [] } } }))
                ]);

                const list1 = res1.records?.Station || [];
                const list2 = res2.records?.Station || [];
                
                const combined = [...list1, ...list2];
                const seenIds = new Set();
                const seenNames = new Set();
                weatherStationData = [];

                combined.forEach(station => {
                    const sId = station.StationId;
                    const sName = station.StationName;
                    if (sId && !seenIds.has(sId) && sName && !seenNames.has(sName)) {
                        seenIds.add(sId);
                        seenNames.add(sName);
                        weatherStationData.push(station);
                    }
                });

                warningData = res4.records?.location || res4.records?.hazard || res4.records?.dataset?.hazards || res4.records?.dataset?.location || [];

                forecastPopData = {};
                forecastWxData = {};
                forecastMinTData = {};
                forecastMaxTData = {};
                const popLocations = resPop.records?.location || resPop.records?.dataset?.location || [];
                popLocations.forEach(loc => {
                    let locName = (loc.locationName || '').replace('台', '臺');
                    const elements = loc.weatherElement || [];
                    const popElement = elements.find(e => e.elementName === 'PoP');
                    const wxElement = elements.find(e => e.elementName === 'Wx');
                    const minTElement = elements.find(e => e.elementName === 'MinT');
                    const maxTElement = elements.find(e => e.elementName === 'MaxT');

                    if (popElement && popElement.time && popElement.time.length > 0) {
                        const firstTimeSlot = popElement.time[0];
                        const popVal = parseInt(firstTimeSlot.parameter?.parameterName || '0', 10);
                        forecastPopData[locName] = isNaN(popVal) ? 0 : popVal;
                    }
                    if (wxElement && wxElement.time && wxElement.time.length > 0) {
                        const firstTimeSlot = wxElement.time[0];
                        forecastWxData[locName] = {
                            text: firstTimeSlot.parameter?.parameterName || '--',
                            code: firstTimeSlot.parameter?.parameterValue || '1'
                        };
                    }
                    if (minTElement && minTElement.time && minTElement.time.length > 0) {
                        forecastMinTData[locName] = minTElement.time[0].parameter?.parameterName || '--';
                    }
                    if (maxTElement && maxTElement.time && maxTElement.time.length > 0) {
                        forecastMaxTData[locName] = maxTElement.time[0].parameter?.parameterName || '--';
                    }
                });

                if (weatherStationData.length > 0) {
                    let latestTimeStr = '--';
                    let times = weatherStationData.map(s => {
                        let t = s.ObsTime?.DateTime || s.ObsTime;
                        return t ? new Date(t).getTime() : 0;
                    }).filter(t => !isNaN(t) && t > 0);

                    if (times.length > 0) {
                        let maxTime = new Date(Math.max(...times));
                        let yyyy = maxTime.getFullYear();
                        let mm = String(maxTime.getMonth() + 1).padStart(2, '0');
                        let dd = String(maxTime.getDate()).padStart(2, '0');
                        let hh = String(maxTime.getHours()).padStart(2, '0');
                        let min = String(maxTime.getMinutes()).padStart(2, '0');
                        latestTimeStr = `${yyyy}/${mm}/${dd} ${hh}:${min}`;
                    }

                    const mapObsTag = document.getElementById('mapObsTimeTag');
                    if (mapObsTag) {
                        mapObsTag.innerText = `CWA 同步更新：${latestTimeStr}`;
                    }

                    const currentCity = document.getElementById('citySelect').value;
                    buildCityStationStructure();
                    if (!currentCity) {
                        initSelectOptions();
                    } else {
                        renderCurrentStationData();
                    }
                    renderRankings();
                    renderWeatherStateGrid();
                    renderCountyForecastGrid();
                    if (mapInitialized) renderMapMarkers();
                }
            } catch (err) {
                console.error("無法取得資料:", err);
            } finally {
                setTimeout(() => {
                    if (btn) btn.classList.remove('spinning');
                }, 500);
                if (callback) callback();
            }
        }

function getPopForStation(county, town) {
            if (forecastPopData[town] !== undefined) return forecastPopData[town];
            if (forecastPopData[county] !== undefined) return forecastPopData[county];
            return 10;
        }

function getCWAWeatherIconObj(code, isNight) {
            const c = parseInt(code, 10);
            if (c === 1) {
                return { icon: isNight ? '🌙' : '☀️' };
            } else if (c >= 2 && c <= 3) {
                return { icon: isNight ? '☁️' : '⛅' };
            } else if (c === 4) {
                return { icon: '☁️' };
            } else if (c >= 5 && c <= 7) {
                return { icon: '🌥️' };
            } else if (c >= 8 && c <= 14) {
                return { icon: '🌧️' };
            } else if (c >= 15 && c <= 22) {
                return { icon: '⛈️' };
            }
            return { icon: '🌤️' };
        }

function renderWeatherStateGrid() {
            const container = document.getElementById('weatherStateGridContainer');
            if (!container) return;

            let html = '';
            const isNight = new Date().getHours() < 6 || new Date().getHours() > 18;

            TAIWAN_REGIONS_ORDER.forEach(county => {
                const wxInfo = forecastWxData[county] || { text: '--', code: '1' };
                const pop = forecastPopData[county] !== undefined ? forecastPopData[county] : '--';
                const iconObj = getCWAWeatherIconObj(wxInfo.code, isNight);

                html += `
                    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 14px; text-align: center; display: flex; flex-direction: column; gap: 6px; align-items: center; transition: all 0.2s;" class="ranking-card">
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-color);">${county}</div>
                        <div style="font-size: 34px; margin: 4px 0;" title="${wxInfo.text}">${iconObj.icon}</div>
                        <div style="font-size: 12px; font-weight: 600; color: #38bdf8; min-height: 28px; display: flex; align-items: center; justify-content: center; line-height: 1.2;">${wxInfo.text}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">降雨機率: ${pop}%</div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

function renderCountyForecastGrid() {
            const container = document.getElementById('countyForecastGridContainer');
            if (!container) return;

            let html = '';
            const isNight = new Date().getHours() < 6 || new Date().getHours() > 18;

            TAIWAN_REGIONS_ORDER.forEach(county => {
                const wxInfo = forecastWxData[county] || { text: '--', code: '1' };
                const minT = forecastMinTData[county] || '--';
                const maxT = forecastMaxTData[county] || '--';
                const iconObj = getCWAWeatherIconObj(wxInfo.code, isNight);

                html += `
                    <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 14px; text-align: center; display: flex; flex-direction: column; gap: 6px; align-items: center; transition: all 0.2s;" class="ranking-card">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-color);">${county}</div>
                        <div style="font-size: 32px; margin: 2px 0;" title="${wxInfo.text}">${iconObj.icon}</div>
                        <div style="font-size: 12px; font-weight: 600; color: #38bdf8; min-height: 26px; display: flex; align-items: center; justify-content: center; line-height: 1.2;">${wxInfo.text}</div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-top: 2px;">
                            <span style="color: #3b82f6;">${minT}°C</span> ~ <span style="color: #ef4444;">${maxT}°C</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
