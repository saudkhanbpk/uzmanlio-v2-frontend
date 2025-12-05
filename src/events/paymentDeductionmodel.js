import { useState, useEffect } from "react";

const PaymentDeductionModal = ({
    isOpen,
    onClose,
    selectedClients,
    customerPackageMap,
    onConfirm
}) => {
    const [customerPaymentSettings, setCustomerPaymentSettings] = useState({});

    // Initialize payment settings when selected clients change
    useEffect(() => {
        if (selectedClients.length > 0) {
            const initialSettings = {};

            selectedClients.forEach(client => {
                const clientId = client._id || client.id;
                const clientPackages = customerPackageMap.find(
                    cp => cp.userId === clientId
                );

                // Get the first package's orderId if available
                const firstPackage = clientPackages?.userPackages?.[0];

                initialSettings[clientId] = {
                    userId: clientId,
                    paymentMethod: clientPackages?.userPackages?.length > 0 ? 'paketten-tahsil' : 'online',
                    packageId: firstPackage?.packageId || null,
                    orderId: firstPackage?.orderId || null
                };
            });

            setCustomerPaymentSettings(initialSettings);
        }
    }, [selectedClients, customerPackageMap]);

    const handlePaymentMethodChange = (clientId, method) => {
        setCustomerPaymentSettings(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                paymentMethod: method,
                packageId: method === 'paketten-tahsil' ? prev[clientId]?.packageId : null
            }
        }));
    };

    const handlePackageSelectionChange = (clientId, packageId) => {
        const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
        const selectedPackage = clientPackages?.userPackages?.find(pkg => pkg.packageId === packageId);

        setCustomerPaymentSettings(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                packageId: packageId,
                orderId: selectedPackage?.orderId || null
            }
        }));
    };

    const handleConfirm = () => {
        console.log("Payment Settings:", customerPaymentSettings);
        onConfirm(customerPaymentSettings);
        onClose();
    };

    if (!isOpen) return null;

    // Separate clients into those with and without packages
    const clientsWithPackages = selectedClients.filter(client => {
        const clientId = client._id || client.id;
        const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
        return clientPackages?.userPackages?.length > 0;
    });

    const clientsWithoutPackages = selectedClients.filter(client => {
        const clientId = client._id || client.id;
        const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
        return !clientPackages?.userPackages?.length;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Ödeme Ayarları</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Clients WITH Packages */}
                {clientsWithPackages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Paket Sahibi Danışanlar ({clientsWithPackages.length})
                        </h3>
                        <div className="space-y-4">
                            {clientsWithPackages.map(client => {
                                const clientId = client._id || client.id;
                                const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
                                const settings = customerPaymentSettings[clientId] || {};

                                return (
                                    <div key={clientId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center mb-3">
                                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-primary-600 font-medium">
                                                    {client.name?.charAt(0)}{client.surname?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{client.fullName}</p>
                                                <p className="text-sm text-gray-500">{client.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Payment Method Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Ödeme Şekli *
                                                </label>
                                                <select
                                                    value={settings.paymentMethod || 'paketten-tahsil'}
                                                    onChange={(e) => handlePaymentMethodChange(clientId, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                >
                                                    <option value="online">Online</option>
                                                    <option value="havale-eft">Havale / EFT</option>
                                                    <option value="paketten-tahsil">Paketten Tahsil Et</option>
                                                </select>
                                            </div>

                                            {/* Package Selection Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Paket Seçimi *
                                                </label>
                                                <select
                                                    value={settings.packageId || ''}
                                                    onChange={(e) => handlePackageSelectionChange(clientId, e.target.value)}
                                                    disabled={settings.paymentMethod !== 'paketten-tahsil'}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    {clientPackages?.userPackages?.map((pkg, index) => (
                                                        <option key={index} value={pkg.packageId}>
                                                            {pkg.packageName} ({pkg.remainingSessions} seans kaldı)
                                                        </option>
                                                    ))}
                                                </select>
                                                {settings.paymentMethod !== 'paketten-tahsil' && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Paketten tahsil seçeneği seçilmediği için devre dışı
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Clients WITHOUT Packages */}
                {clientsWithoutPackages.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Paketsiz Danışanlar ({clientsWithoutPackages.length})
                        </h3>
                        <div className="space-y-4">
                            {clientsWithoutPackages.map(client => {
                                const clientId = client._id || client.id;
                                const settings = customerPaymentSettings[clientId] || {};

                                return (
                                    <div key={clientId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center mb-3">
                                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-primary-600 font-medium">
                                                    {client.name?.charAt(0)}{client.surname?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{client.fullName}</p>
                                                <p className="text-sm text-gray-500">{client.email}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ödeme Şekli *
                                            </label>
                                            <select
                                                value={settings.paymentMethod || 'online'}
                                                onChange={(e) => handlePaymentMethodChange(clientId, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="online">Online</option>
                                                <option value="havale-eft">Havale / EFT</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Bu danışanın aktif paketi bulunmamaktadır
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Onayla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDeductionModal;