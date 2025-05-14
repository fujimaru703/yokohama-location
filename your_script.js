// `your_script.js` の中で

// Protobufスキーマの読み込み
const schemaUrl = 'path_to_your_schema.proto'; // 実際のプロトコルバッファスキーマを指定

async function loadSchema() {
  const root = await protobuf.load(schemaUrl);
  return root;
}

// GTFS Realtime API からバイナリデータを取得
async function fetchAndParseData() {
  const apiUrl = 'https://crimson-night-b53e.fujimaru703.workers.dev/';
  const response = await fetch(apiUrl);
  const buffer = await response.arrayBuffer();

  // スキーマをロードしてデータをパース
  const root = await loadSchema();
  const VehiclePosition = root.lookupType('VehiclePosition');  // 必要なメッセージタイプに合わせて変更

  const message = VehiclePosition.decode(new Uint8Array(buffer));

  // 車番や路線行先のデータを取り出す
  const vehicleData = message.entity.map(entity => ({
    vehicleId: entity.vehicle.id,
    route: entity.vehicle.routeTag,
    lat: entity.vehicle.position.latitude,
    lon: entity.vehicle.position.longitude,
  }));

  return vehicleData;
}

// Leaflet マップにマーカーを表示
async function displayOnMap() {
  const data = await fetchAndParseData();

  // マップの作成
  const map = L.map('map').setView([35.6895, 139.6917], 13);  // 初期位置とズームレベル設定

  // TileLayer（地図のタイル）を設定
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // 取得した車両データをマーカーとしてマップに表示
  data.forEach(vehicle => {
    const { lat, lon, vehicleId, route } = vehicle;
    const popupContent = `<b>車番:</b> ${vehicleId}<br><b>路線行先:</b> ${route}`;

    // マーカーを作成して地図に追加
    L.marker([lat, lon])
      .bindPopup(popupContent)
      .addTo(map);
  });
}

// マップ表示
displayOnMap();
