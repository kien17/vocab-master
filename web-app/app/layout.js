import './globals.css';

export const metadata = {
  title: 'Vocab Master - Học từ vựng IELTS',
  description: 'Ứng dụng học từ vựng tiếng Anh với Spaced Repetition để đạt IELTS 7.5+',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
