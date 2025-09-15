import { useState } from "react";

// NotesModal Component - Shows customer notes and allows platform user to add/update notes
export default  function NotesModal ({ customer, onClose }) {
  const [newNote, setNewNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Mock customer notes and files data (sorted by newest first)
  const customerNotes = [
    {
      id: 1,
      content: 'Web sitesi tasarımı için inspirasyon siteleri listesi ekliyorum. Modern ve minimalist tasarım tercih ediyorum.',
      author: 'customer',
      authorName: customer.name,
      date: '2024-07-28',
      time: '14:30',
      files: [
        {
          name: 'inspirasyon_siteler.pdf',
          type: 'pdf',
          size: '2.3 MB',
          url: '#'
        }
      ]
    },
    {
      id: 2,
      content: 'Müşteri portföyündeki referans çalışmaları beğendim. Benzer stil ile devam edebiliriz.',
      author: 'platform',
      authorName: 'Platform Kullanıcısı',
      date: '2024-07-27',
      time: '16:45',
      files: []
    },
    {
      id: 3,
      content: 'Proje için logo dosyalarımı ekliyorum. PNG ve SVG formatlarında mevcut.',
      author: 'customer',
      authorName: customer.name,
      date: '2024-07-26',
      time: '09:15',
      files: [
        {
          name: 'logo.png',
          type: 'image',
          size: '500 KB',
          url: '#'
        },
        {
          name: 'logo.svg',
          type: 'image',
          size: '25 KB',
          url: '#'
        }
      ]
    },
    {
      id: 4,
      content: 'İlk toplantımız çok verimli geçti. İhtiyaçlarım detaylı bir şekilde anlaşıldı.',
      author: 'customer',
      authorName: customer.name,
      date: '2024-07-25',
      time: '11:00',
      files: []
    },
    {
      id: 5,
      content: 'Müşteri ile görüştük. Proje kapsamı ve timeline konusunda anlaştık. Gelecek hafta başlıyoruz.',
      author: 'platform',
      authorName: 'Platform Kullanıcısı',
      date: '2024-07-24',
      time: '13:30',
      files: []
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim() || uploadedFile) {
      const newNoteData = {
        id: Date.now(),
        content: newNote,
        author: 'platform',
        authorName: 'Platform Kullanıcısı',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        files: uploadedFile ? [{
          name: uploadedFile.name,
          type: uploadedFile.type.startsWith('image/') ? 'image' : 'document',
          size: `${(uploadedFile.size / 1024).toFixed(1)} KB`,
          url: '#'
        }] : []
      };
      
      console.log('Yeni not eklendi:', newNoteData);
      
      // Reset form
      setNewNote('');
      setUploadedFile(null);
      setFilePreview('');
    }
  };

  const getFileIcon = (type) => {
    if (type === 'image') return '🖼️';
    if (type === 'pdf') return '📄';
    return '📎';
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    
    return `${day} ${month} ${dayName} ${time}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-screen">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{customer.name} - Notlar</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {/* Notes Display Area */}
          <div className="p-6 max-h-96 overflow-y-auto border-b border-gray-200">
            <div className="space-y-4">
              {customerNotes.map((note) => (
                <div key={note.id} className={`flex ${note.author === 'platform' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    note.author === 'platform' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {note.author === 'platform' ? '👨‍💼 Siz' : '👤 Müşteri'}
                      </span>
                      <span className={`text-xs ${
                        note.author === 'platform' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatDateTime(note.date, note.time)}
                      </span>
                    </div>
                    
                    <p className="text-sm">{note.content}</p>
                    
                    {/* Files */}
                    {note.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {note.files.map((file, index) => (
                          <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                            note.author === 'platform' ? 'bg-primary-700' : 'bg-white border'
                          }`}>
                            <span className="text-sm">{getFileIcon(file.type)}</span>
                            <div className="flex-1">
                              <p className={`text-xs font-medium ${
                                note.author === 'platform' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {file.name}
                              </p>
                              <p className={`text-xs ${
                                note.author === 'platform' ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                {file.size}
                              </p>
                            </div>
                            <button className={`text-xs underline ${
                              note.author === 'platform' ? 'text-primary-100' : 'text-blue-600'
                            }`}>
                              İndir
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Note Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Not Ekle
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="Notunuzu buraya yazın..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="flex items-center space-x-4">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-2">📎</span>
                    <span className="text-sm">Dosya Ekle</span>
                  </label>
                </div>

                {/* Show uploaded file */}
                {uploadedFile && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm">{getFileIcon(uploadedFile.type.startsWith('image/') ? 'image' : 'document')}</span>
                    <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFilePreview('');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {filePreview && (
                <div className="mt-2">
                  <img src={filePreview} alt="Preview" className="max-w-xs h-auto rounded-lg" />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={!newNote.trim() && !uploadedFile}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Not Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};