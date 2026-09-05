function switchMainPage(pageId) {
            document.getElementById('tabDashboard').classList.toggle('active', pageId === 'dashboard');
            document.getElementById('tabMap').classList.toggle('active', pageId === 'map');
            document.getElementById('tabCountyForecast').classList.toggle('active', pageId === 'countyForecast');
            document.getElementById('tabWeatherState').classList.toggle('active', pageId === 'weatherState');
            document.getElementById('tabQuakeAlert').classList.toggle('active', pageId === 'quakeAlert');
            document.getElementById('tabQuake').classList.toggle('active', pageId === 'quake');
            document.getElementById('tabTyphoon').classList.toggle('active', pageId === 'typhoon');
            
            document.getElementById('dashboardPanel').classList.toggle('active', pageId === 'dashboard');
            document.getElementById('mapPanel').classList.toggle('active', pageId === 'map');
            document.getElementById('countyForecastPanel').classList.toggle('active', pageId === 'countyForecast');
            document.getElementById('weatherStatePanel').classList.toggle('active', pageId === 'weatherState');
            document.getElementById('quakeAlertPanel').classList.toggle('active', pageId === 'quakeAlert');
            document.getElementById('quakePanel').classList.toggle('active', pageId === 'quake');
            document.getElementById('typhoonPanel').classList.toggle('active', pageId === 'typhoon');

            if (pageId === 'map' && !mapInitialized) {
                setTimeout(initMap, 100);
            } else if (pageId === 'map' && mapInitialized) {
                setTimeout(() => { map.invalidateSize(); }, 100);
            }
        }
