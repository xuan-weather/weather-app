function renderPast24hChart(station, obsTimeString) {
            const currentData = parseStationElement(station);
            const currentTemp = currentData.temp;
            const displayName = currentStationType === 'freeway' ? station.StationName : (station.GeoInfo?.TownName || station.StationName);
            document.getElementById('chartMainTitle').innerText = `${displayName} 24 小時溫度變化趨勢`;

            if (isNaN(currentTemp)) {
                document.getElementById('chartTimeSubtitle').innerText = `目前無有效溫度數據`;
                initPastChart([], [], []);
                return;
            }

            let fullDateLabels = [];
            let xAxisLabels = [];
            let temps = [];

            let baseDate = obsTimeString && obsTimeString !== '--' ? new Date(obsTimeString) : new Date();
            if (isNaN(baseDate.getTime())) {
                baseDate = new Date();
            }
            baseDate.setMinutes(0, 0, 0);
            const baseTime = baseDate.getTime();

            const formatDateStr = (d) => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:00`;

            for (let i = 24; i >= 0; i--) {
                const d = new Date(baseTime - i * 60 * 60 * 1000);
                fullDateLabels.push(formatDateStr(d));
                xAxisLabels.push(`${String(d.getHours()).padStart(2,'0')}:00`);
                
                let simulatedTemp = currentTemp + Math.sin(i / 3) * 1.5;
                temps.push(Number(simulatedTemp.toFixed(1)));
            }

            document.getElementById('chartTimeSubtitle').innerText = `${fullDateLabels[0]} ~ ${fullDateLabels[fullDateLabels.length - 1]}`;
            initPastChart(xAxisLabels, temps, fullDateLabels);
        }

function initPastChart(labels, dataValues, fullDates) {
            const ctx = document.getElementById('tempChart').getContext('2d');
            if (tempChart) tempChart.destroy();

            tempChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '溫度 (°C)',
                        data: dataValues,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#38bdf8'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                title: (context) => fullDates[context[0].dataIndex] || context[0].label,
                                label: (context) => ` 溫度: ${context.raw} °C`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(150, 150, 150, 0.1)' },
                            ticks: { color: '#94a3b8', font: { size: 11 }, maxTicksLimit: 8 }
                        },
                        y: {
                            grid: { color: 'rgba(150, 150, 150, 0.1)' },
                            ticks: { color: '#94a3b8', font: { size: 11 } }
                        }
                    }
                }
            });
        }
