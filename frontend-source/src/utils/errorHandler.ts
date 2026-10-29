import axios from 'axios';
import { AppResponseError, ParsedApiError } from '../types/error';

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AppResponseError | undefined;
    const status = error.response?.status || 500;

    if (data) {
      const fieldErrors = data.details || {};
      let message = data.message;

      // Handle custom business messages if needed
      if (data.errorCode === 'ORD-003') {
        message = 'Chiến dịch flash sale này chưa mở!';
      } else if (message?.includes('Đã mua sản phẩm')) {
        message = 'Bạn đã mua sản phẩm này trong chiến dịch rồi (mỗi người 1 lượt)!';
      } else if (message?.includes('Sản phẩm đã hết')) {
        message = 'Rất tiếc, sản phẩm trong chiến dịch này đã hết hàng!';
      } else if (data.errorCode === 'AUTH-401') {
        message = 'Email hoặc mật khẩu không chính xác, hoặc phiên đã hết hạn.';
      } else if (data.errorCode === 'AUTH-403') {
        message = 'Bạn không có quyền thực hiện thao tác này (cần quyền Quản trị).';
      } else if (data.errorCode === 'RES-404') {
        message = 'Không tìm thấy dữ liệu yêu cầu trên hệ thống.';
      }

      return {
        status,
        errorCode: data.errorCode,
        message: message || 'Đã có lỗi xảy ra từ máy chủ.',
        fieldErrors,
      };
    }

    if (error.code === 'ECONNABORTED' || !error.response) {
      return {
        status: 0,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend hoặc mạng.',
        fieldErrors: {},
      };
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    status: 500,
    message: 'Đã có lỗi không xác định xảy ra.',
    fieldErrors: {},
  };
}
