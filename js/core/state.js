let tempChart = null;
        let map = null;
        let mapInitialized = false;
        let currentMapMode = 'temp'; 
        let currentMarkersLayer = L.layerGroup();
        let legendControl = null;
        let weatherStationData = [];
        let warningData = [];
        let forecastPopData = {}; 
        let forecastWxData = {};
        let forecastMinTData = {};
        let forecastMaxTData = {};
        let earthquakeData = [];
        let typhoonData = [];
        let cityStationMapping = {};
        let currentStationType = 'normal';
        let currentRankingTab = 'rain';

        const TAIWAN_REGIONS_ORDER = [
            "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
            "臺中市", "彰化縣", "南投縣", "雲林縣",
            "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣",
            "宜蘭縣", "花蓮縣", "臺東縣",
            "澎湖縣", "金門縣", "連江縣"
        ];
