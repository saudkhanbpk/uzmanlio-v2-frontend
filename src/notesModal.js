import { useState, useEffect } from "react";
import { customerService } from "./services/customerService";

// NotesModal Component - Shows customer notes and allows platform user to add/update notes
export default function NotesModal({ customer, onClose }) {
  const [notes, setNotes] = useState([]);
  const [noteError, setNoteError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingNote, setAddingNote] = useState(false);

  const userId = localStorage.getItem('userId') // Mock user ID for development

  // Load customer notes on component mount
  useEffect(() => {
    loadCustomerNotes();
  }, [customer.id]);

  const loadCustomerNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await customerService.getCustomerNotes(userId, customer._id || customer.id);
      setNotes(notesData.notes || []);
    } catch (err) {
      setError('Notlar yüklenirken bir hata oluştu.');
      console.error('Error loading customer notes:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNewNote(value);

    // Simple validation
    if (value.trim().length === 0 && !uploadedFile) {
      setNoteError('Not boş olamaz.');
    } else {
      setNoteError('');
    }
  };



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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim() && !uploadedFile) {
      setNoteError('Not boş olamaz.');
      return;
    }

    try {
      setAddingNote(true);
      setError(null);
      setNoteError('');
      const formData = new FormData();
      formData.append('content', newNote.trim() || "Dosya yüklendi");
      formData.append('author', 'expert');
      formData.append('authorName', 'Platform Kullanıcısı');

      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      await customerService.addCustomerNote(userId, customer._id || customer.id, formData);

      await loadCustomerNotes();

      setNewNote('');
      setUploadedFile(null);
      setFilePreview('');
    } catch (err) {
      setError('Not eklenirken bir hata oluştu.');
      console.error('Error adding note:', err);
    } finally {
      setAddingNote(false);
    }
  };


  const getFileIcon = (type) => {
    if (type === 'image') return '🖼️';
    if (type === 'pdf') return '📄';
    return '📎';
  };

  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const time = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return `${day} ${month} ${dayName} ${time}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-y-auto text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-screen">

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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadCustomerNotes}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz not eklenmemiş.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notes
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((note) => {
                    const isExpert = note.author === 'expert';
                    const isSystem = note.author !== 'expert' && note.author !== 'customer';

                    return (
                      <div
                        key={note.id || note._id}
                        className={`flex ${isExpert ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${isExpert
                            ? 'bg-green-100 text-gray-900 rounded-tr-none'
                            : isSystem
                              ? 'bg-blue-50 text-gray-900 border border-blue-200'
                              : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}
                        >
                          <div className="flex items-center space-x-2 mb-1 justify-between gap-2">
                            <span className="text-xs font-medium">
                              {isExpert ? '👨‍💼 Siz' : isSystem ? '⚙️ Sistem' : '👤 Müşteri'}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDateTime(note.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>

                          {/* Files */}
                          {note.files && note.files.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {note.files.map((file, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 rounded bg-white bg-opacity-60 border border-gray-200">
                                  <span className="text-sm">{getFileIcon(file.type)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <a
                                    href={`${process.env.REACT_APP_BACKEND_URL}${file.url}`}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline text-blue-600 whitespace-nowrap ml-2"
                                  >
                                    İndir
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
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
                  onChange={handleNoteChange}
                  rows={3}
                  placeholder="Notunuzu buraya yazın..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${noteError ? 'border-red-500' : 'border-gray-300'}`}
                />
                {noteError && <p className="text-red-500 text-sm mt-1">{noteError}</p>}
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
                  disabled={!newNote.trim() && !uploadedFile || addingNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingNote ? 'Ekleniyor...' : 'Not Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};