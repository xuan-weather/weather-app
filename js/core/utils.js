function getWindDirectionText(degree) {
            if (isNaN(degree) || degree < 0) return '靜風';
            if (degree > 337.5 || degree <= 22.5) return '北風';
            if (degree > 22.5 && degree <= 67.5) return '東北風';
            if (degree > 67.5 && degree <= 112.5) return '東風';
            if (degree > 112.5 && degree <= 157.5) return '東南風';
            if (degree > 157.5 && degree <= 202.5) return '南風';
            if (degree > 202.5 && degree <= 247.5) return '西南風';
            if (degree > 247.5 && degree <= 292.5) return '西風';
            if (degree > 292.5 && degree <= 337.5) return '西北風';
            return '靜風';
        }

function getWindLevel(ms) {
            if (isNaN(ms) || ms < 0) return '0級';
            if (ms < 0.3) return '0級';
            if (ms < 1.6) return '1級';
            if (ms < 3.4) return '2級';
            if (ms < 5.5) return '3級';
            if (ms < 8.0) return '4級';
            if (ms < 10.8) return '5級';
            if (ms < 13.9) return '6級';
            if (ms < 17.2) return '7級';
            if (ms < 20.8) return '8級';
            if (ms < 24.5) return '9級';
            if (ms < 28.5) return '10級';
            if (ms < 32.7) return '11級';
            if (ms < 37.0) return '12級';
            if (ms < 41.5) return '13級';
            if (ms < 46.2) return '14級';
            if (ms < 51.0) return '15級';
            if (ms < 56.1) return '16級';
            return '17級以上';
        }

function formatObsTime(dateTimeStr) {
            if (!dateTimeStr) return '--:--';
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) {
                return dateTimeStr.length >= 16 ? dateTimeStr.substring(11, 16) : dateTimeStr;
            }
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }

function parseStationElement(station) {
            const we = station.WeatherElement || {};
            let rawObsTime = station.ObsTime?.DateTime || station.ObsTime || '--';
            if (typeof rawObsTime === 'object') {
                rawObsTime = rawObsTime.DateTime || '--';
            }

            let temp = parseFloat(we.AirTemperature ?? we.TEMP);
            if (isNaN(temp) || temp < -50) temp = NaN;

            let rain = parseFloat(we.Now?.Precipitation ?? we.DailyAccumulation ?? we.NOW?.Precipitation);
            if (isNaN(rain) || rain < 0) rain = 0;

            let windSpeed = parseFloat(we.WindSpeed ?? we.WDSD);
            if (isNaN(windSpeed) || windSpeed < 0) windSpeed = 0;

            let windGust = parseFloat(we.GustInfo?.PeakGustSpeed ?? we.GUST ?? we.WindGust ?? we.GustSpeed);
            if (isNaN(windGust) || windGust < 0) windGust = windSpeed;

            let windDir = parseFloat(we.WindDirection ?? we.WDIR);
            if (isNaN(windDir) || windDir < 0) windDir = -1;

            let humidityRaw = we.RelativeHumidity ?? we.HUMD;
            let humidity = parseFloat(humidityRaw);
            if (isNaN(humidity) || humidity < 0 || humidity > 100) {
                humidity = '--';
            } else {
                humidity = Math.round(humidity);
            }

            let elevation = parseFloat(station.Elevation || station.GeoInfo?.Elevation || 0);

            return { temp, rain, windSpeed, windGust, windDir, humidity, elevation, obsTime: rawObsTime };
        }

function isFreewayStation(stationName) {
            return stationName && (stationName.includes('國一') || stationName.includes('國三') || stationName.includes('國五') || stationName.includes('國道') || stationName.includes('N323K'));
        }

function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

function determineWeatherCondition(rain, humidity, pop = 0) {
            if (rain > 0.5 || pop >= 70) {
                return { icon: "🌧️", title: "降雨", desc: "目前有雨或降雨機率高，請攜帶雨具" };
            } else if (pop >= 30 || (humidity !== '--' && humidity > 80)) {
                return { icon: "☁️", title: "多雲時陰 / 有雨機會", desc: "雲量偏多，可能有局部降雨" };
            } else if (humidity !== '--' && humidity > 65) {
                return { icon: "⛅", title: "晴時多雲", desc: "天候狀況良好，雲層偶見" };
            } else {
                return { icon: "☀️", title: "晴朗", desc: "陽光露臉，天晴舒適" };
            }
        }
