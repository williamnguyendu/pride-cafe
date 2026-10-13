const SPREADSHEET_ID = '1F6Xo5Xq0WRefvGZMtxk-sqp5yqXTwJ6Gy-bGRVzImms';

// Hàm xử lý HTTP GET (Dùng để lấy thông tin sự kiện)
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getEvent') {
    return ContentService.createTextOutput(JSON.stringify(getEventInfo()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Pride Cafe API is running...");
}

// Hàm xử lý HTTP POST (Dùng để nhận dữ liệu đăng ký)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'register') {
      const result = registerUser(data.name, data.phone);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm lấy thông tin sự kiện "Mở đăng ký" mới nhất
function getEventInfo() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('LichCafe');
  
  if (!sheet) return { error: 'Không tìm thấy sheet LichCafe' };
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1); // Bỏ qua dòng tiêu đề
  
  // Lọc các sự kiện có trạng thái "Mở đăng ký" (cột TrangThai ở vị trí index 5)
  let activeEvents = rows.filter(row => row[5] === 'Mở đăng ký');
  
  if (activeEvents.length === 0) {
    return { status: 'closed' };
  }
  
  // Sắp xếp giảm dần theo NgayToChuc (cột index 1) để lấy ngày lớn nhất
  activeEvents.sort((a, b) => new Date(b[1]) - new Date(a[1]));
  
  const targetEvent = activeEvents[0];
  
  return {
    status: 'open',
    ngayToChuc: targetEvent[1],
    diaDiem: targetEvent[2],
    dangKyTu: targetEvent[3],
    dangKyDen: targetEvent[4]
  };
}

// Hàm ghi thông tin đăng ký vào Sheet
function registerUser(name, phone) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // Ưu tiên sheet DangKyLangMaSoi như yêu cầu, dự phòng bằng DangKyCafe
  let sheet = ss.getSheetByName('DangKyLangMaSoi'); 
  if (!sheet) {
    sheet = ss.getSheetByName('DangKyCafe');
  }
  
  if (!sheet) return { success: false, message: 'Không tìm thấy sheet lưu trữ' };
  
  const thoiGianDangKy = new Date(); // Lấy thời gian thực
  
  // Append dữ liệu (Cột 1: Thời gian, Cột 2: Tên, Cột 3: SĐT)
  sheet.appendRow([thoiGianDangKy, name, phone]);
  
  return { success: true };
}