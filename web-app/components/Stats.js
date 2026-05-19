'use client';

export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-blue-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Tổng từ</p>
        <p className="text-3xl font-bold text-blue-600">{stats.totalWords}</p>
      </div>
      
      <div className="bg-purple-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Mức trung bình</p>
        <p className="text-3xl font-bold text-purple-600">{stats.averageLevel}</p>
      </div>
      
      <div className="bg-green-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Thành thạo (%)</p>
        <p className="text-3xl font-bold text-green-600">{stats.masteredPercentage}%</p>
      </div>

      <div className="bg-red-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Level 1</p>
        <p className="text-2xl font-bold text-red-600">{stats.level1Count}</p>
      </div>

      <div className="bg-yellow-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Level 2-3</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.level2Count + stats.level3Count}</p>
      </div>

      <div className="bg-green-100 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Level 4-5</p>
        <p className="text-2xl font-bold text-green-600">{stats.level4Count + stats.level5Count}</p>
      </div>
    </div>
  );
}
