// CreateCouponModal Component
export const CreateCouponModal = ({ onClose }) => {
  const [couponData, setCouponData] = useState({
    code: '',
    type: 'percentage', // percentage or amount
    value: '',
    maxUsage: '',
    expiryDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCouponData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Kupon oluşturuldu:', couponData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Kupon Oluştur</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kupon Kodu *
              </label>
              <input
                type="text"
                name="code"
                value={couponData.code}
                onChange={handleInputChange}
                placeholder="Örn: YENI2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İndirim Tipi *
              </label>
              <select
                name="type"
                value={couponData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="percentage">Yüzde (%)</option>
                <option value="amount">TL İndirim</option>
              </select>
            </div>

            {/* Coupon Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kupon Değeri *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="value"
                  value={couponData.value}
                  onChange={handleInputChange}
                  placeholder="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500">
                    {couponData.type === 'percentage' ? '%' : 'TL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kullanım Adedi *
              </label>
              <input
                type="number"
                name="maxUsage"
                value={couponData.maxUsage}
                onChange={handleInputChange}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Son Kullanma Tarihi *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={couponData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

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
                Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
