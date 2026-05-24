import { Info } from 'lucide-react';

interface ModuleNoticeProps {
  /** Tên thành viên phụ trách */
  owner: string;
  /** Tên module nghiệp vụ */
  module: string;
}

/** Banner thông báo module chưa nối API — chờ thành viên phụ trách triển khai */
export function ModuleNotice({ owner, module }: ModuleNoticeProps) {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">
        <p className="font-medium">Module {module}</p>
        <p className="mt-1 text-amber-800">
          {/* TODO: gắn API backend khi thành viên phụ trách hoàn thiện */}
          Đang chờ <strong>{owner}</strong> triển khai API. Giao diện hiển thị dữ liệu từ hệ thống khi API sẵn sàng — hiện tại có thể trống.
        </p>
      </div>
    </div>
  );
}
