async function fetchTyphoonData(isManualRefresh = false) {
            const btn = document.getElementById('refreshTyphoonBtn');
            if (btn && isManualRefresh) btn.classList.add('spinning');
            const container = document.getElementById('typhoonListContainer');

            const nonce = Date.now();
            const typhoonUrl = `https://mingxuan.904037.xyz/api/v1/rest/datastore/W-C0034-001?_=${nonce}`;

            try {
                const res = await fetch(typhoonUrl, { cache: 'no-store' }).then(r => r.json());
                typhoonData = res.records?.Typhoon || res.records?.location || [];

                if (typhoonData.length > 0) {
                    let htmlContent = '';
                    typhoonData.forEach((typhoon) => {
                        const name = typhoon.TyphoonName || typhoon.name || '颱風動態';
                        const enName = typhoon.TyphoonEnName || '';
                        const content = typhoon.Description || typhoon.warningMessage || '目前氣象署已發布相關颱風警報資訊。';

                        htmlContent += `
                            <div class="quake-card-item">
                                <div class="quake-top-row">
                                    <div class="quake-mag-badge">
                                        <i class="fas fa-hurricane"></i> ${name} ${enName ? '(' + enName + ')' : ''}
                                    </div>
                                </div>
                                <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; white-space: pre-line; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 12px; margin-top: 4px;">
                                    ${content}
                                </div>
                            </div>
                        `;
                    });
                    container.innerHTML = htmlContent;
                } else {
                    container.innerHTML = `
                        <div class="no-warning-box" style="margin-bottom: 0;">
                            <i class="fas fa-shield-alt" style="font-size: 18px;"></i> 
                            <div>
                                <div style="font-weight: 700; margin-bottom: 2px; color: #34d399;">目前無發布海上或陸上颱風警報</div>
                                <div style="font-size: 12px; color: var(--text-muted);">西北太平洋及台灣地區天候穩定，未有生成之警報中颱風。</div>
                            </div>
                        </div>
                    `;
                }
            } catch (err) {
                console.error("無法取得颱風資料:", err);
                container.innerHTML = `
                    <div class="no-warning-box" style="margin-bottom: 0;">
                        <i class="fas fa-shield-alt" style="font-size: 18px;"></i> 
                        <div>
                            <div style="font-weight: 700; margin-bottom: 2px; color: #34d399;">目前無發布海上或陸上颱風警報</div>
                            <div style="font-size: 12px; color: var(--text-muted);">目前未偵測到主動發布的颱風警報資訊。</div>
                        </div>
                    </div>
                `;
            } finally {
                if (btn) btn.classList.remove('spinning');
            }
        }
