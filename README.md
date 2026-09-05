## 📂 專案檔案結構

### 🌐 根目錄
- **`index.html`**：頁面結構與第三方套件載入

### 🎨 樣式表 (`css/`)
- **`base.css`**：主題變數、重設與頁面基礎
- **`navigation.css`**：頁籤導覽與內容面板切換
- **`components.css`**：共用面板、標題與操作按鈕
- **`dashboard.css`**：測站控制、即時氣象與資訊卡片
- **`rankings.css`**：即時氣象排行榜
- **`charts.css`**：24 小時溫度圖表區塊
- **`map.css`**：Leaflet 地圖、圖例、標記與彈出資訊
- **`alerts.css`**：氣象警報、地震速報與地震卡片

### ⚡ JavaScript 模組 (`js/`)
* **核心 (`js/core/`)**
  - **`state.js`**：共用狀態與常數
  - **`utils.js`**：格式化、資料解析與通用工具
* **介面 (`js/ui/`)**
  - **`theme.js`**：深色／淺色主題
  - **`navigation.js`**：主頁籤切換
* **氣象功能 (`js/weather/`)**
  - **`weather-data.js`**：氣象資料取得與縣市預報
  - **`rankings.js`**：即時排行榜
  - **`stations.js`**：測站選擇、警報與儀表板
  - **`location.js`**：GPS 定位與鄰近測站
* **圖表與地圖 (`js/charts/`, `js/map/`)**
  - **`temperature-chart.js`**：24 小時溫度圖表
  - **`weather-map.js`**：Leaflet 地圖、圖例與標記
* **警報與事件 (`js/alerts/`, 根目錄)**
  - **`earthquakes.js`**：地震資料與詳細資訊
  - **`typhoons.js`**：颱風資料
  - **`events.js`**：所有點擊與選單變更事件
  - **`app.js`**：啟動流程與定時更新