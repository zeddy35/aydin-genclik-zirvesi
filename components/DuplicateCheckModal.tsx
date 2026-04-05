"use client";

import { AlertCircle } from "lucide-react";

interface DuplicateCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailExists: boolean;
  phoneExists: boolean;
  email?: string;
  phone?: string;
}

export function DuplicateCheckModal({
  isOpen,
  onClose,
  emailExists,
  phoneExists,
  email,
  phone,
}: DuplicateCheckModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 space-y-6 animate-in fade-in zoom-in">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-900">
            Hesap Zaten Var
          </h3>
          <p className="text-sm text-gray-600">
            {emailExists && phoneExists
              ? "Bu email ve telefon numarası zaten sistemde kullanılıyor."
              : emailExists
              ? `Bu email adresi (${email}) zaten sistemde kayıtlı.`
              : `Bu telefon numarası (${phone}) zaten sistemde kayıtlı.`}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 İpucu:</strong> Eğer bu hesap sizin ise, lütfen giriş
            yapınız. Farklı bir bilgi girmek isterseniz, lütfen önceki adıma
            dönün.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            Geri Dön
          </button>
          <button
            onClick={() => {
              window.location.href = "/auth/login";
            }}
            className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
