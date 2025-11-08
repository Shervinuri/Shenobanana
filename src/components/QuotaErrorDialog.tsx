/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { HourglassIcon } from './icons';

interface QuotaErrorDialogProps {
  onClose: () => void;
}

const QuotaErrorDialog: React.FC<QuotaErrorDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-gray-800 border border-yellow-500/50 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-red-600/20 p-4 rounded-full mb-6">
          <HourglassIcon className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">سهمیه رایگان شما تمام شد</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          متاسفانه سهمیه استفاده رایگان روزانه شما (۵۰ درخواست در روز) برای مدل هوش مصنوعی به پایان رسیده است. این سهمیه هر ۲۴ ساعت یکبار تمدید می‌شود.
        </p>
        <p className="text-gray-400 mb-8 text-sm">
          برای استفاده بدون محدودیت، می‌توانید با فعال‌سازی پرداخت در پروژه گوگل کلاد خود، از برنامه به صورت نامحدود استفاده کنید.
          <br/>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline font-medium"
          >
            اطلاعات بیشتر در مورد فعال‌سازی پرداخت
          </a>
        </p>
        <div className="w-full flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors text-lg"
            >
              باشه، فهمیدم
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaErrorDialog;
