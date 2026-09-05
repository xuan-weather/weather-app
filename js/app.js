window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('cwa_theme') || 'dark';
            setTheme(savedTheme);

            fetchAllStationData(false, () => {
                initUserLocationWeather();
            });
            fetchEarthquakeData(false);
            fetchTyphoonData(false);

            setInterval(() => {
                fetchEarthquakeData(false);
            }, 30000);
        });
