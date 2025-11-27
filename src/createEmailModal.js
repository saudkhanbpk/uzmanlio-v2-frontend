import React, { useState, useEffect } from 'react';

// CreateEmailModal Component
export const CreateEmailModal = ({ onClose, onSave, initialData }) => {
  const [emailData, setEmailData] = useState({
    title: '',
    text: '',
    recipientType: 'all', // all or selected
    selectedCustomers: [],
    scheduledAt: ''
  });

  useEffect(() => {
    if (initialData) {
      // Convert UTC scheduledAt to local datetime-local format
      let localScheduledAt = '';
      if (initialData.scheduledAt) {
        const date = new Date(initialData.scheduledAt);
        // Format to YYYY-MM-DDTHH:MM, which is what datetime-local input expects
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        localScheduledAt = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      setEmailData({
        ...initialData,
        scheduledAt: localScheduledAt,
        // Ensure other fields have defaults
        title: initialData.title || '',
        text: initialData.text || '',
        recipientType: initialData.recipientType || 'all',
        selectedCustomers: initialData.selectedCustomers || [],
      });
      setShowCustomerSelection(initialData.recipientType === 'selected');
    }
  }, [initialData]);
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [validationError, setValidationError] = useState('');

  // Mock customer data
  const availableCustomers = [
    { id: 1, name: 'hane1', email: 'saudkhanbpk@gmail.com' },
    { id: 2, name: 's2', email: 'muhammadharoonawaan@gmail.com' },
    { id: 3, name: 's4', email: '4testerhss@gmail.com' },
    { id: 4, name: 'Ali Yılmaz', email: 'ali.yilmaz@email.com' },

  ];

  const filteredCustomers = availableCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Clear validation error when user edits
    setValidationError('');
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientTypeChange = (e) => {
    const { value } = e.target;
    setEmailData(prev => ({
      ...prev,
      recipientType: value,
      selectedCustomers: value === 'all' ? [] : prev.selectedCustomers
    }));
    setShowCustomerSelection(value === 'selected');
  };

  const handleCustomerSelect = (customerId) => {
    const customer = availableCustomers.find(c => c.id === customerId);
    setEmailData(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.some(c => c.id === customerId)
        ? prev.selectedCustomers.filter(c => c.id !== customerId)
        : [...prev.selectedCustomers, customer]
    }));
  };

  const handleRemoveCustomer = (customerId) => {
    setEmailData(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.filter(c => c.id !== customerId)
    }));
  };

  const isSendNow = () => {
    if (!emailData.scheduledAt) return false;
    const sched = new Date(emailData.scheduledAt);
    const now = new Date();
    // consider "now" if within 90 seconds
    return Math.abs(now.getTime() - sched.getTime()) <= 90 * 1000;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Append placeholders at the end of the email body
    let body = emailData.text;
    body += '\n\n{{expert_name}}\n{{company_name}}';
    // Build payload matching backend: subject, body, recipientType, recipients[], scheduledAt
    const payload = {
      subject: emailData.title,
      body: body,
      recipientType: emailData.recipientType,
      recipients: emailData.recipientType === 'selected' ? emailData.selectedCustomers.map(c => c.email) : [],
      scheduledAt: emailData.scheduledAt ? new Date(emailData.scheduledAt).toISOString() : undefined
    };
    const sendNow = isSendNow();
    if (onSave) {
      // await parent save so modal only closes after action completes
      try {
        await onSave(payload, { sendNow });
      } catch (err) {
        // parent will show errors; keep modal open for user to retry
        return;
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">E-Posta Oluştur</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Posta Başlığı *
              </label>
              <input
                type="text"
                name="title"
                value={emailData.title}
                onChange={handleInputChange}
                placeholder="Örn: Yeni Kurs Duyurusu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Posta Metni *
              </label>
              <textarea
                name="text"
                value={emailData.text}
                onChange={handleInputChange}
                rows={6}
                placeholder="E-posta içeriğinizi buraya yazın..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alıcılar *
              </label>
              <select
                name="recipientType"
                value={emailData.recipientType}
                onChange={handleRecipientTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="all">Tüm Müşteri Listesi ({availableCustomers.length} kişi)</option>
                <option value="selected">Seçili Müşteriler</option>
              </select>
            </div>

            {/* Scheduled At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gönderim Tarihi ve Saati *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={emailData.scheduledAt}
                onChange={(e) => {
                  handleInputChange(e);
                  // validate immediately
                  const val = e.target.value;
                  if (val) {
                    const selected = new Date(val);
                    const now = new Date();
                    if (selected.getTime() < now.getTime()) {
                      setValidationError('Geçmiş bir tarih seçemezsiniz.');
                    } else {
                      setValidationError('');
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                // set min to now in local datetime-local format to prevent picker past selection
                min={(() => {
                  const n = new Date();
                  const y = n.getFullYear();
                  const m = String(n.getMonth() + 1).padStart(2, '0');
                  const d = String(n.getDate()).padStart(2, '0');
                  const hh = String(n.getHours()).padStart(2, '0');
                  const mm = String(n.getMinutes()).padStart(2, '0');
                  return `${y}-${m}-${d}T${hh}:${mm}`;
                })()}
              />
              {validationError && <p className="text-red-500 text-sm mt-1">{validationError}</p>}
            </div>

            {/* Customer Selection - Only visible when "selected" is chosen */}
            {showCustomerSelection && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Müşteri Seç
                </label>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Müşteri adı veya e-posta ile ara..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pl-10"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>

                {/* Selected Customers Display */}
                {emailData.selectedCustomers.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Seçili Müşteriler ({emailData.selectedCustomers.length}):</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {emailData.selectedCustomers.map((customer) => (
                        <span
                          key={customer.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          {customer.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomer(customer.id)}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer List */}
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer.id)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${emailData.selectedCustomers.some(c => c.id === customer.id)
                            ? 'bg-primary-50 text-primary-700'
                            : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                          {emailData.selectedCustomers.some(c => c.id === customer.id) && (
                            <span className="text-primary-600">✓</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Aradığınız kriterlere uygun müşteri bulunamadı.
                    </div>
                  )}
                </div>

                {emailData.recipientType === 'selected' && emailData.selectedCustomers.length === 0 && (
                  <p className="text-red-500 text-sm">En az bir müşteri seçmelisiniz.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isSendNow() ? 'Gönder' : 'Zamanla'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
