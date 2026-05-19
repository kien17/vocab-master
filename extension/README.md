# Vocab Master - Chrome Extension

Phần mở rộng Chrome để lưu từ vựng từ bất kỳ trang web nào.

## Cấu trúc:
- `manifest.json` - Manifest V3 configuration
- `background.js` - Service Worker (xử lý context menu, gửi API)
- `content.js` - Content script
- `popup.html` / `popup.js` - Popup giao diện

## Cách cài đặt:
1. Mở `chrome://extensions/`
2. Bật "Developer mode" (góc trên phải)
3. Click "Load unpacked"
4. Chọn folder `extension`

## Sử dụng:
1. Bôi đen cụm từ trên web
2. Click chuột phải → "Lưu cụm từ vào Vocab Master"
3. Từ sẽ được lưu và gửi đến database

## Lưu ý:
- Thay đổi `API_BASE_URL` trong `background.js` khi deploy
- Cần phải có Supabase + Gemini API keys trong backend
