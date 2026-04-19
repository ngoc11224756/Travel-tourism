import { getDistanceMatrix, geocodeAddress } from "./routeService";

/**
 * Geocode danh sách địa điểm → lấy tọa độ [lng, lat]
 * Trả về places kèm coords, bỏ qua địa điểm geocode thất bại
 */
export async function resolvePlaceCoords(places) {
  const results = await Promise.all(
    places.map(async (place) => {
      try {
        // Nếu place đã có coords thì dùng luôn
        if (place.coords) return { ...place };
        const coords = await geocodeAddress(place.name || place.address);
        return { ...place, coords };
      } catch {
        return { ...place, coords: null };
      }
    })
  );
  return results.filter((p) => p.coords !== null);
}

/**
 * Gọi ORS để lấy ma trận khoảng cách giữa các địa điểm
 * Trả về matrix[i][j] = khoảng cách (km) từ i đến j
 */
export async function buildDistanceMatrix(places) {
  const coords = places.map((p) => p.coords); // [[lng, lat], ...]
  const raw = await getDistanceMatrix(coords);

  // ORS trả về durations hoặc distances (đơn vị giây hoặc mét)
  // Chuẩn hóa về km
  const matrix = raw.map((row) => row.map((val) => val / 1000));
  return matrix;
}

/**
 * Nearest Neighbor — tìm lộ trình ngắn nhất từ điểm xuất phát
 * @param {number[][]} matrix  - ma trận khoảng cách n×n
 * @param {number}     startIdx - index điểm xuất phát (mặc định 0)
 * @param {number|null} pinEnd  - index điểm kết thúc cố định (null = không cố định)
 * @returns {number[]} thứ tự index tối ưu
 */
export function nearestNeighbor(matrix, startIdx = 0, pinEnd = null) {
  const n = matrix.length;
  const visited = new Array(n).fill(false);
  const order = [];

  // Nếu có pinEnd, loại nó ra khỏi vòng lặp chính
  const excludeFromLoop = new Set();
  if (pinEnd !== null && pinEnd !== startIdx) {
    excludeFromLoop.add(pinEnd);
  }

  let current = startIdx;
  visited[current] = true;
  order.push(current);

  while (order.length < n - excludeFromLoop.size) {
    let nearest = -1;
    let minDist = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && !excludeFromLoop.has(j) && matrix[current][j] < minDist) {
        minDist = matrix[current][j];
        nearest = j;
      }
    }

    if (nearest === -1) break;
    visited[nearest] = true;
    order.push(nearest);
    current = nearest;
  }

  // Gắn điểm kết thúc cố định vào cuối
  if (pinEnd !== null && pinEnd !== startIdx) {
    order.push(pinEnd);
  }

  return order;
}

/**
 * 2-opt improvement — loại bỏ các đoạn đường "chéo nhau"
 * Chạy sau Nearest Neighbor để tinh chỉnh kết quả
 * @param {number[]}   order  - thứ tự index từ nearestNeighbor
 * @param {number[][]} matrix - ma trận khoảng cách
 * @param {number|null} pinStart - index bị khóa đầu (không đảo)
 * @param {number|null} pinEnd   - index bị khóa cuối (không đảo)
 * @returns {number[]} thứ tự đã được cải thiện
 */
export function twoOpt(order, matrix, pinStart = null, pinEnd = null) {
  const n = order.length;
  let improved = true;
  let best = [...order];

  // Xác định range được phép đảo (tránh đụng pinStart/pinEnd)
  const iMin = pinStart !== null ? 1 : 0;
  const iMax = pinEnd !== null ? n - 2 : n - 1;

  while (improved) {
    improved = false;
    for (let i = iMin; i < iMax - 1; i++) {
      for (let j = i + 1; j <= iMax; j++) {
        const a = best[i - 1 >= 0 ? i - 1 : 0];
        const b = best[i];
        const c = best[j];
        const d = best[j + 1 < n ? j + 1 : j];

        const currentDist = matrix[a][b] + matrix[c][d];
        const newDist = matrix[a][c] + matrix[b][d];

        if (newDist < currentDist - 1e-10) {
          // Đảo ngược đoạn từ i đến j
          const reversed = best.slice(i, j + 1).reverse();
          best = [...best.slice(0, i), ...reversed, ...best.slice(j + 1)];
          improved = true;
        }
      }
    }
  }

  return best;
}

/**
 * Tính tổng khoảng cách của một lộ trình
 */
export function totalDistance(order, matrix) {
  let dist = 0;
  for (let i = 0; i < order.length - 1; i++) {
    dist += matrix[order[i]][order[i + 1]];
  }
  return dist;
}

/**
 * Hàm chính — gọi từ PlanCreate
 * @param {object[]} places     - danh sách địa điểm có coords
 * @param {object}   constraints
 *   - pinStart: index địa điểm muốn đến trước (null = không ràng buộc)
 *   - pinEnd:   index địa điểm muốn dừng cuối (null = không ràng buộc)
 * @returns {{ orderedPlaces, order, distanceKm, matrix }}
 */
export async function optimizeRoute(places, constraints = {}) {
  if (places.length <= 1) {
    return {
      orderedPlaces: places,
      order: [0],
      distanceKm: 0,
      matrix: [[0]],
    };
  }

  const { pinStart = 0, pinEnd = null } = constraints;

  // Bước 1: lấy ma trận khoảng cách từ ORS
  const matrix = await buildDistanceMatrix(places);

  // Bước 2: Nearest Neighbor với ràng buộc
  const nnOrder = nearestNeighbor(matrix, pinStart, pinEnd);

  // Bước 3: 2-opt tinh chỉnh
  const finalOrder = twoOpt(nnOrder, matrix, pinStart, pinEnd);

  // Bước 4: sắp xếp lại danh sách địa điểm theo thứ tự tối ưu
  const orderedPlaces = finalOrder.map((i) => places[i]);
  const distanceKm = totalDistance(finalOrder, matrix);

  return {
    orderedPlaces,
    order: finalOrder,
    distanceKm: Math.round(distanceKm * 10) / 10,
    matrix,
  };
}