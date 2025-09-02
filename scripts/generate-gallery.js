const fs = require('fs');
const path = require('path');

function generateGallery() {
  const screenshotsDir = './screenshots';
  const publicDir = './public/result';
  const publicScreenshotsDir = path.join(publicDir, 'screenshots');
  const resultsFile = path.join(publicDir, 'results.json');

  // public/result ディレクトリを作成
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // public/result/screenshots ディレクトリを作成
  if (!fs.existsSync(publicScreenshotsDir)) {
    fs.mkdirSync(publicScreenshotsDir, { recursive: true });
  }

  // 既存の結果を読み込み
  let results = [];
  if (fs.existsSync(resultsFile)) {
    try {
      results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    } catch (error) {
      console.log('既存の結果ファイルの読み込みに失敗しました:', error.message);
    }
  }

  // スクリーンショットファイルを取得
  let screenshots = [];
  if (fs.existsSync(screenshotsDir)) {
    screenshots = fs.readdirSync(screenshotsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => {
        const filePath = path.join(screenshotsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          timestamp: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // 新しい結果エントリを作成（日本時間で記録）
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstTime = new Date(now.getTime() + (jstOffset * 60 * 1000));
  
  const currentResult = {
    timestamp: jstTime.toISOString(),
    runId: process.env.GITHUB_RUN_NUMBER || Date.now().toString(),
    status: screenshots.length > 0 ? 'failed' : 'success',
    screenshots: screenshots.map(s => ({
      filename: s.filename,
      timestamp: new Date(s.timestamp.getTime() + (jstOffset * 60 * 1000)).toISOString(),
      size: s.size
    }))
  };

  // スクリーンショットをpublic/screenshotsにコピー
  screenshots.forEach(screenshot => {
    const destPath = path.join(publicScreenshotsDir, screenshot.filename);
    fs.copyFileSync(screenshot.path, destPath);
    console.log(`コピー完了: ${screenshot.filename}`);
  });

  // 結果を更新（最新20件まで保持）
  results.unshift(currentResult);
  results = results.slice(0, 20);

  // 結果ファイルを保存
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  // HTMLページを生成
  generateHTML(results);

  console.log(`ギャラリーを生成しました: ${screenshots.length}枚のスクリーンショット`);
}

function generateHTML(results) {
  const latestResult = results[0] || { screenshots: [], status: 'success', timestamp: new Date().toISOString() };
  
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FCバイエルン チケットチェック結果</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            color: #dc143c;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 1.2em;
            font-weight: bold;
        }
        .status.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.failed {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .last-check {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 0.9em;
        }
        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .screenshot-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .screenshot-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .screenshot-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            cursor: pointer;
        }
        .screenshot-info {
            padding: 15px;
            background: #fff;
        }
        .screenshot-filename {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .screenshot-timestamp {
            color: #666;
            font-size: 0.8em;
        }
        .history {
            margin-top: 40px;
            border-top: 2px solid #eee;
            padding-top: 30px;
        }
        .history h2 {
            color: #555;
            margin-bottom: 20px;
        }
        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .history-item:last-child {
            border-bottom: none;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
        }
        .modal-content {
            position: relative;
            margin: auto;
            padding: 20px;
            width: 90%;
            max-width: 1000px;
            top: 50%;
            transform: translateY(-50%);
        }
        .modal-content img {
            width: 100%;
            height: auto;
            border-radius: 8px;
        }
        .close {
            position: absolute;
            top: 10px;
            right: 25px;
            color: white;
            font-size: 35px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover {
            opacity: 0.7;
        }
        .no-screenshots {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px;
        }
        .nav-link {
            display: inline-block;
            background-color: #dc143c;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            margin-bottom: 20px;
            transition: background-color 0.2s;
        }
        .nav-link:hover {
            background-color: #b91c3c;
            color: white;
            text-decoration: none;
        }
        .nav-container {
            text-align: center;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <main class="container">
        <div class="nav-container">
            <a href="https://fujimmm331.github.io/websiteChecker/" class="nav-link" target="_blank">
                🏠 メインサイトに戻る
            </a>
        </div>
        
        <h1>⚽ テスト実行結果</h1>
        
        <div class="status ${latestResult.status}">
            ${latestResult.status === 'success' 
                ? '✅ チケット確認完了 - 問題なし' 
                : '❌ チケット確認失敗 - 要確認'}
        </div>
        
        <div class="last-check">
            最終チェック: ${new Date(latestResult.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
        </div>

        ${latestResult.screenshots.length > 0 ? `
            <h2>🖼️ スクリーンショット</h2>
            <div class="screenshots">
                ${latestResult.screenshots.map(screenshot => `
                    <div class="screenshot-card">
                        <img src="screenshots/${screenshot.filename}" 
                             alt="${screenshot.filename}"
                             onclick="openModal('screenshots/${screenshot.filename}')"
                             loading="lazy">
                        <div class="screenshot-info">
                            <div class="screenshot-filename">${screenshot.filename}</div>
                            <div class="screenshot-timestamp">${new Date(screenshot.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="no-screenshots">
                📸 今回はスクリーンショットはありません（テスト成功）
            </div>
        `}

        <div class="history">
            <h2>📊 実行履歴</h2>
            ${results.map(result => `
                <div class="history-item">
                    <div>
                        <span style="margin-right: 10px;">
                            ${result.status === 'success' ? '✅' : '❌'}
                        </span>
                        ${new Date(result.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                    </div>
                    <div>
                        ${result.screenshots.length > 0 ? `${result.screenshots.length}枚` : 'スクリーンショットなし'}
                    </div>
                </div>
            `).join('')}
        </div>
    </main>

    <!-- Modal -->
    <div id="imageModal" class="modal" onclick="closeModal()">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <img id="modalImage" src="">
        </div>
    </div>

    <script>
        function openModal(src) {
            document.getElementById('imageModal').style.display = 'block';
            document.getElementById('modalImage').src = src;
        }

        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join('./public/result', 'index.html'), html);
}

// スクリプト実行
if (require.main === module) {
  generateGallery();
}

module.exports = { generateGallery };