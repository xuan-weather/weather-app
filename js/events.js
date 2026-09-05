(() => {
    'use strict';

    const closest = (event, selector) => event.target.closest(selector);

    document.addEventListener('click', (event) => {
        const pageButton = closest(event, '[data-page]');
        if (pageButton) {
            switchMainPage(pageButton.dataset.page);
            return;
        }

        const actionButton = closest(event, '[data-action]');
        if (actionButton) {
            const actions = {
                'toggle-theme': () => toggleTheme(),
                'refresh-weather': () => fetchAllStationData(true),
                'refresh-location': () => initUserLocationWeather(),
                'refresh-earthquakes': () => fetchEarthquakeData(true),
                'refresh-typhoons': () => fetchTyphoonData(true),
            };
            actions[actionButton.dataset.action]?.();
            return;
        }

        const stationTypeButton = closest(event, '[data-station-type]');
        if (stationTypeButton) {
            setStationType(stationTypeButton.dataset.stationType);
            return;
        }

        const rankingButton = closest(event, '[data-ranking-tab]');
        if (rankingButton) {
            switchRankingTab(rankingButton.dataset.rankingTab);
            return;
        }

        const mapModeButton = closest(event, '[data-map-mode]');
        if (mapModeButton) {
            switchMapMode(mapModeButton.dataset.mapMode);
            return;
        }

        const stationCard = closest(event, '[data-station-id]');
        if (stationCard) {
            selectStationById(stationCard.dataset.stationId);
            return;
        }

        const quakeCard = closest(event, '[data-quake-index]');
        if (quakeCard) {
            showQuakeDetail(Number(quakeCard.dataset.quakeIndex));
            return;
        }

        const modalCloseButton = closest(event, '[data-modal-close]');
        if (modalCloseButton) {
            const modal = document.getElementById(modalCloseButton.dataset.modalClose);
            if (modal) modal.style.display = 'none';
        }
    });

    document.addEventListener('change', (event) => {
        if (event.target.matches('[data-change="city"]')) {
            onCityChange();
        } else if (event.target.matches('[data-change="station"]')) {
            onStationChange();
        }
    });
})();
