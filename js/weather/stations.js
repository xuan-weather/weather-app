function setStationType(type) {
            currentStationType = type;
            document.querySelectorAll('#stationTypeToggle .segment-btn').forEach(btn => {
                if(btn.dataset.type) {
                    btn.classList.toggle('active', btn.dataset.type === type);
                }
            });
            initSelectOptions();
        }

function buildCityStationStructure() {
            cityStationMapping = {};
            weatherStationData.forEach(station => {
                let county = station.GeoInfo?.CountyName;
                if (county) {
                    county = county.replace('台', '臺');
                    if (!cityStationMapping[county]) cityStationMapping[county] = [];
                    cityStationMapping[county].push(station);
                }
            });
        }

function initSelectOptions() {
            const citySelect = document.getElementById('citySelect');
            const currentSelectedCity = citySelect.value;
            citySelect.innerHTML = '';

            const sortedAndFilteredCities = TAIWAN_REGIONS_ORDER.filter(city => {
                const cityStations = cityStationMapping[city];
                if (!cityStations || cityStations.length === 0) return false;
                
                if (currentStationType === 'freeway') {
                    return cityStations.some(s => isFreewayStation(s.StationName));
                } else {
                    return cityStations.some(s => !isFreewayStation(s.StationName));
                }
            });

            sortedAndFilteredCities.forEach(city => {
                const opt = document.createElement('option');
                opt.value = city;
                opt.textContent = city;
                citySelect.appendChild(opt);
            });

            if (sortedAndFilteredCities.includes(currentSelectedCity)) {
                citySelect.value = currentSelectedCity;
            } else if (sortedAndFilteredCities.length > 0) {
                citySelect.value = sortedAndFilteredCities[0];
            }

            updateStationOptions();
        }

function updateStationOptions() {
            const selectedCity = document.getElementById('citySelect').value;
            const stationSelect = document.getElementById('stationSelect');
            const currentSelectedStationId = stationSelect.value;
            stationSelect.innerHTML = '';

            if (!selectedCity) return;

            const stations = cityStationMapping[selectedCity] || [];
            
            let filteredStations = stations.filter(s => {
                if (currentStationType === 'freeway') return isFreewayStation(s.StationName);
                if (currentStationType === 'normal') return !isFreewayStation(s.StationName);
                return true;
            });

            filteredStations.sort((a, b) => a.StationName.localeCompare(b.StationName, 'zh-TW'));

            if (filteredStations.length === 0) {
                const opt = document.createElement('option');
                opt.disabled = true;
                opt.textContent = "此縣市無符合的測站";
                stationSelect.appendChild(opt);
                return;
            }

            filteredStations.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.StationId;
                opt.textContent = currentStationType === 'freeway' ? s.StationName : `${s.StationName} (${s.GeoInfo?.TownName || ''})`;
                stationSelect.appendChild(opt);
            });

            const exists = filteredStations.some(s => s.StationId === currentSelectedStationId);
            if (exists) {
                stationSelect.value = currentSelectedStationId;
            } else {
                stationSelect.value = filteredStations[0].StationId;
            }

            renderCurrentStationData();
        }

function onCityChange() { updateStationOptions(); }

function onStationChange() { renderCurrentStationData(); }

function checkCityWarnings(cityName) {
            const alertBox = document.getElementById('warningAlertBox');
            const noAlertBox = document.getElementById('noWarningBox');
            const titleEl = document.getElementById('warningTitleText');
            const contentEl = document.getElementById('warningContentText');
            const dashboardAlarmLight = document.getElementById('dashboardAlarmLight');

            const matchedLocation = warningData.find(loc => (loc.locationName || "").replace('台', '臺') === cityName);

            if (matchedLocation && matchedLocation.hazardConditions && matchedLocation.hazardConditions.hazards.length > 0) {
                const hazards = matchedLocation.hazardConditions.hazards;
                let warningTitles = [];
                let warningTexts = [];

                hazards.forEach(h => {
                    const info = h.info || {};
                    let phenomena = info.phenomena || "特別天氣";
                    let significance = info.significance || "";

                    warningTitles.push(phenomena);
                    warningTexts.push(`【${phenomena}】${significance}`);
                });

                titleEl.innerText = `⚠️ ${cityName} - ${warningTitles.join(' / ')}`;
                contentEl.innerText = warningTexts.join('\n') || "該地區目前有發布氣象特報，請注意防範。";
                alertBox.classList.add('active');
                noAlertBox.style.display = 'none';

                if (dashboardAlarmLight) dashboardAlarmLight.classList.add('active');
            } else {
                alertBox.classList.remove('active');
                noAlertBox.style.display = 'flex';

                if (dashboardAlarmLight) dashboardAlarmLight.classList.remove('active');
            }
        }

function renderCurrentStationData() {
            const selectedCity = document.getElementById('citySelect').value;
            const selectedStationId = document.getElementById('stationSelect').value;

            checkCityWarnings(selectedCity);

            const targetStation = weatherStationData.find(s => s.StationId === selectedStationId);

            if (targetStation) {
                updateDashboardWithStation(targetStation);
            } else {
                document.getElementById('currentStationTag').innerText = `代表測站：無資料`;
                document.getElementById('obsTimeTag').innerText = `觀測時間：--:--`;
                document.getElementById('liveTemp').innerText = '-- °C';
                document.getElementById('liveWind').innerText = '--';
                document.getElementById('liveHumidity').innerText = '-- %';
                document.getElementById('livePop').innerText = '-- %';
                document.getElementById('liveRain').innerText = '-- mm';
            }
        }

function updateDashboardWithStation(targetStation) {
            const data = parseStationElement(targetStation);
            const county = (targetStation.GeoInfo?.CountyName || '').replace('台', '臺');
            const town = targetStation.GeoInfo?.TownName || '';
            const townName = town ? ` (${town})` : '';

            const popVal = getPopForStation(county, town);
            const weatherCond = determineWeatherCondition(data.rain, data.humidity, popVal);
            
            document.getElementById('weatherStatusIcon').innerText = weatherCond.icon;
            document.getElementById('weatherStatusTitle').innerText = weatherCond.title;
            document.getElementById('weatherStatusDesc').innerText = weatherCond.desc;

            document.getElementById('currentStationTag').innerText = `代表測站：${targetStation.StationName}${currentStationType === 'normal' ? townName : ''}`;
            document.getElementById('obsTimeTag').innerText = `觀測時間：${formatObsTime(data.obsTime)}`;

            document.getElementById('liveTemp').innerText = !isNaN(data.temp) ? `${data.temp.toFixed(1)} °C` : '-- °C';
            document.getElementById('liveWind').innerText = `${getWindDirectionText(data.windDir)} ${Math.round(data.windSpeed)} m/s (${getWindLevel(data.windSpeed)}) / 陣風 ${Math.round(data.windGust)} m/s (${getWindLevel(data.windGust)})`;
            document.getElementById('liveHumidity').innerText = data.humidity !== '--' ? `${data.humidity} %` : '-- %';
            document.getElementById('livePop').innerText = `${popVal} %`;
            document.getElementById('liveRain').innerText = `${data.rain.toFixed(1)} mm`;

            renderPast24hChart(targetStation, data.obsTime);
        }
