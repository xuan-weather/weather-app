async function fetchEarthquakeData(isManualRefresh = false) {
            const btn = document.getElementById('refreshQuakeBtn');
            if (btn && isManualRefresh) btn.classList.add('spinning');
            const container = document.getElementById('quakeListContainer');
            const alertContainer = document.getElementById('quakeAlertLiveContainer');

            const nonce = Date.now();
            const majorEqUrl = `https://mingxuan.904037.xyz/api/v1/rest/datastore/E-A0015-001?_=${nonce}`;
            const localEqUrl = `https://mingxuan.904037.xyz/api/v1/rest/datastore/E-A0016-001?_=${nonce}`;

            try {
                const [resMajor, resLocal] = await Promise.all([
                    fetch(majorEqUrl, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { Earthquake: [] } })),
                    fetch(localEqUrl, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ records: { Earthquake: [] } }))
                ]);

                const majorList = resMajor.records?.Earthquake || [];
                const localList = resLocal.records?.Earthquake || [];

                let combinedEq = [...majorList, ...localList];
                combinedEq.sort((a, b) => {
                    const timeA = new Date(a.EarthquakeInfo?.OriginTime || 0).getTime();
                    const timeB = new Date(b.EarthquakeInfo?.OriginTime || 0).getTime();
                    return timeB - timeA;
                });

                earthquakeData = combinedEq;
                window.quakeDataList = earthquakeData;

                if (earthquakeData.length > 0) {
                    const latestEq = earthquakeData[0];
                    const info = latestEq.EarthquakeInfo || {};
                    const originTime = info.OriginTime || '--';
                    const magnitude = info.EarthquakeMagnitude?.MagnitudeValue || '--';
                    const depth = info.FocalDepth || '--';
                    const location = info.Epicenter?.Location || '台灣地區';
                    const reportImage = latestEq.ReportImageURI || '';
                    
                    let intensityListHtml = '';
                    const shakeAreas = info.Intensity?.ShakingArea || [];
                    if (shakeAreas.length > 0) {
                        intensityListHtml = `<div style="margin-top: 12px; font-size: 13px;"><b>各地最大震度：</b><div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">`;
                        shakeAreas.forEach(area => {
                            intensityListHtml += `<span style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); padding: 3px 8px; border-radius: 8px; font-size: 12px;">${area.CountyName}: <b>${area.AreaIntensity}</b></span>`;
                        });
                        intensityListHtml += `</div></div>`;
                    }

                    if (alertContainer) {
                        alertContainer.innerHTML = `
                            <div class="quake-flash-card">
                                <div class="quake-flash-header">
                                    <div class="quake-live-badge">
                                        <i class="fas fa-bell"></i> 氣象署即時速報
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${originTime}</div>
                                </div>
                                <div style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">
                                    ${location}
                                </div>
                                <div class="quake-p-grid">
                                    <div class="quake-p-box">
                                        <span>地震規模 (M)</span>
                                        <b>${magnitude}</b>
                                    </div>
                                    <div class="quake-p-box">
                                        <span>地震深度</span>
                                        <b>${depth} 公里</b>
                                    </div>
                                </div>
                                ${intensityListHtml}
                                ${reportImage ? `<div style="margin-top: 14px; text-align: center;"><img src="${reportImage}" style="max-width: 100%; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);" alt="地震速報圖"></div>` : ''}
                            </div>
                        `;
                    }

                    let htmlContent = '';
                    earthquakeData.forEach((eq, index) => {
                        const eqInfo = eq.EarthquakeInfo || {};
                        const oTime = eqInfo.OriginTime || '--';
                        const mag = eqInfo.EarthquakeMagnitude?.MagnitudeValue || '--';
                        const dep = eqInfo.FocalDepth || '--';
                        const loc = eqInfo.Epicenter?.Location || '台灣地區';
                        const isLocal = eq.ReportType === '小區域有感地震報告' ? ' [小區域]' : '';

                        htmlContent += `
                            <div class="quake-card-item" data-quake-index="${index}" style="cursor: pointer;" title="點擊查看詳細震度">
                                <div class="quake-top-row">
                                    <div class="quake-mag-badge" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
                                        <i class="fas fa-bolt"></i> 規模 M ${mag}${isLocal}
                                    </div>
                                    <div class="quake-time">${oTime} <i class="fas fa-chevron-right" style="font-size: 10px; margin-left: 4px;"></i></div>
                                </div>
                                <div class="quake-location">${loc}</div>
                                <div class="quake-details-grid">
                                    <div>深度：<b>${dep} 公里</b></div>
                                    <div>點擊看詳細報告 <i class="fas fa-info-circle"></i></div>
                                </div>
                            </div>
                        `;
                    });
                    container.innerHTML = htmlContent;
                } else {
                    container.innerHTML = `<div class="my-location-status">目前查無近期有感地震報告。</div>`;
                    if (alertContainer) alertContainer.innerHTML = `<div class="my-location-status">目前無即時地震速報。</div>`;
                }
            } catch (err) {
                console.error("無法取得地震資料:", err);
                if (earthquakeData.length === 0) {
                    container.innerHTML = `<div class="my-location-status" style="color: #f87171;"><i class="fas fa-exclamation-triangle"></i> 無法取得地震資訊，請稍後再試。</div>`;
                    if (alertContainer) alertContainer.innerHTML = `<div class="my-location-status" style="color: #f87171;">無法取得地震速報。</div>`;
                }
            } finally {
                if (btn) btn.classList.remove('spinning');
            }
        }

function showQuakeDetail(index) {
            const eq = window.quakeDataList?.[index];
            if (!eq) return;

            const info = eq.EarthquakeInfo || {};
            const reportContent = eq.ReportContent || '暫無詳細內容說明';
            const location = info.Epicenter?.Location || '台灣地區';
            const magnitude = info.EarthquakeMagnitude?.MagnitudeValue || '--';
            const depth = info.FocalDepth || '--';
            const originTime = info.OriginTime || '--';
            const reportImage = eq.ReportImageURI || '';

            let intensityHtml = '';
            const shakeAreas = info.Intensity?.ShakingArea || [];
            if (shakeAreas.length > 0) {
                intensityHtml = `<div style="margin-top: 10px; font-size: 13px; color: var(--text-muted);"><b>各地最大震度：</b><ul style="margin-left: 20px; margin-top: 4px;">`;
                shakeAreas.forEach(area => {
                    intensityHtml += `<li>${area.CountyName}：${area.AreaIntensity}</li>`;
                });
                intensityHtml += `</ul></div>`;
            }

            let modal = document.getElementById('quakeDetailModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'quakeDetailModal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
                    display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px;
                `;
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div style="background: var(--panel-bg); border: 1px solid var(--action-border); border-radius: 20px; max-width: 500px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); color: var(--text-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--action-border); padding-bottom: 10px; margin-bottom: 14px;">
                        <h3 style="font-size: 16px; color: #f59e0b;"><i class="fas fa-house-chimney-crack"></i> 地震詳細報告</h3>
                        <button data-modal-close="quakeDetailModal" style="background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="font-size: 14px; margin-bottom: 8px;"><b>發布時間：</b> ${originTime}</div>
                    <div style="font-size: 14px; margin-bottom: 8px;"><b>震央位置：</b> ${location}</div>
                    <div style="font-size: 14px; margin-bottom: 8px;"><b>地震規模：</b> M ${magnitude} | <b>深度：</b> ${depth} 公里</div>
                    <div style="font-size: 13px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 10px; margin-top: 10px; line-height: 1.5; white-space: pre-line;">${reportContent}</div>
                    ${intensityHtml}
                    ${reportImage ? `<div style="margin-top: 14px; text-align: center;"><img src="${reportImage}" style="max-width: 100%; border-radius: 10px; border: 1px solid var(--action-border);" alt="地震報告圖"></div>` : ''}
                    <button data-modal-close="quakeDetailModal" style="width: 100%; margin-top: 16px; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer;">關閉視窗</button>
                </div>
            `;
            modal.style.display = 'flex';
        }
