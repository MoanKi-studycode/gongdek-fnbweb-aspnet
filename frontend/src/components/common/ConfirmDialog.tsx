import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  loading: boolean;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: typeof Info; iconClass: string; confirmClass: string }
> = {
  danger: {
    icon: Trash2,
    iconClass: 'bg-red-100 text-red-600',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'bg-amber-100 text-amber-600',
    confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconClass: 'bg-blue-100 text-blue-600',
    confirmClass: 'bg-[#8B7355] hover:bg-[#6F5B44] text-white',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-green-100 text-green-600',
    confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

interface ConfirmDialogViewProps {
  state: ConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialogView({ state, onCancel, onConfirm }: ConfirmDialogViewProps) {
  const variant = state.variant ?? 'info';
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={state.open} onOpenChange={(open) => !open && !state.loading && onCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:text-left">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', config.iconClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">{state.message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 sm:justify-end">
          <AlertDialogCancel disabled={state.loading} onClick={onCancel}>
            {state.cancelText ?? 'Hủy'}
          </AlertDialogCancel>
          <Button
            type="button"
            className={config.confirmClass}
            disabled={state.loading}
            onClick={onConfirm}
          >
            {state.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {state.confirmText ?? 'Xác nhận'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        ...options,
        variant: options.variant ?? 'info',
        open: true,
        loading: false,
      });
    });
  }, []);

  const handleCancel = () => {
    if (state?.loading) return;
    close(false);
  };

  const handleConfirm = () => {
    close(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmDialogView state={state} onCancel={handleCancel} onConfirm={handleConfirm} />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm phải được dùng trong ConfirmProvider');
  }
  return ctx;
}

/** Preset xác nhận đăng xuất */
export function logoutConfirmOptions(): ConfirmOptions {
  return {
    title: 'Đăng xuất khỏi hệ thống?',
    message: 'Bạn cần đăng nhập lại để tiếp tục sử dụng hệ thống.',
    confirmText: 'Đăng xuất',
    cancelText: 'Ở lại',
    variant: 'info',
  };
}

/** Preset xác nhận đặt hàng online */
export function placeOrderConfirmOptions(): ConfirmOptions {
  return {
    title: 'Xác nhận đặt hàng',
    message: 'Đơn hàng sẽ được gửi đến cửa hàng và chờ xác nhận.',
    confirmText: 'Đặt hàng',
    cancelText: 'Kiểm tra lại',
    variant: 'success',
  };
}

/** Preset xác nhận xóa */
export function deleteConfirmOptions(entity: string, detail?: string): ConfirmOptions {
  return {
    title: `Xác nhận xóa ${entity}`,
    message: detail
      ? detail
      : `Bạn có chắc chắn muốn xóa ${entity} này không? Thao tác này không thể hoàn tác.`,
    confirmText: 'Xóa',
    cancelText: 'Hủy',
    variant: 'danger',
  };
}

/** Preset khóa/mở khóa nhân viên */
export function lockEmployeeConfirmOptions(hoTen: string, isLocked: boolean): ConfirmOptions {
  return isLocked
    ? {
        title: 'Xác nhận mở khóa tài khoản',
        message: `Mở khóa tài khoản "${hoTen}"? Nhân viên sẽ có thể đăng nhập lại.`,
        confirmText: 'Mở khóa',
        cancelText: 'Hủy',
        variant: 'info',
      }
    : {
        title: 'Xác nhận khóa tài khoản',
        message: `Tài khoản "${hoTen}" sẽ không thể đăng nhập sau khi bị khóa.`,
        confirmText: 'Khóa tài khoản',
        cancelText: 'Hủy',
        variant: 'warning',
      };
}
