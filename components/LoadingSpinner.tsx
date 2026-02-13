"use client";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-bunny-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-900 font-bold">로딩 중...</p>
      </div>
    </div>
  );
}
