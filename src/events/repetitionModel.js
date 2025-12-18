import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const RepetitionModal = ({
    isOpen,
    onClose,
    selectedClients,
    customerPackageMap,
    customerPaymentSettings,  // NEW PROP
    onConfirm
}) => {
    const [recurringType, setRecurringType] = useState('weekly');
    const [numberOfRepetitions, setNumberOfRepetitions] = useState(1);
    const [customerRepetitions, setCustomerRepetitions] = useState([]);


    // Initialize customer repetitions when clients change
    useEffect(() => {
        if (selectedClients.length > 0) {
            const initialRepetitions = selectedClients.map(client => {
                const clientId = client._id || client.id;
                const paymentSettings = customerPaymentSettings[clientId];

                return {
                    customerId: clientId,
                    customerName: client.fullName,
                    numberOfRepetitions: numberOfRepetitions,
                    orderId: paymentSettings?.orderId || null,  // ADD ORDER ID
                    packageId: paymentSettings?.packageId || null  // ALSO ADD PACKAGE ID
                };
            });
            setCustomerRepetitions(initialRepetitions);
        }
    }, [selectedClients, numberOfRepetitions, customerPaymentSettings]);

    const handleConfirm = async () => {
        // Validate customers with packages
        const warnings = [];

        for (const client of selectedClients) {
            const clientId = client._id || client.id;
            const paymentSettings = customerPaymentSettings[clientId];

            // Check if customer is using package payment
            if (paymentSettings?.paymentMethod === 'paketten-tahsil' && paymentSettings?.packageId) {
                // Find the specific selected package
                const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
                const selectedPackage = clientPackages?.userPackages?.find(
                    pkg => pkg.packageId === paymentSettings.packageId
                );

                if (!selectedPackage) {
                    warnings.push(`${client.fullName} has no package selected`);
                } else {
                    // Check if the SELECTED package has sufficient sessions
                    const remainingSessions = selectedPackage.remainingSessions;

                    if (remainingSessions < numberOfRepetitions) {
                        warnings.push(
                            `${client.fullName} has insufficient sessions in selected package (${remainingSessions} available, ${numberOfRepetitions} needed)`
                        );
                    }
                }
            } else {
                // Customer is not using package payment
                warnings.push(`${client.fullName} is not using package payment`);
            }
        }

        // Show warning if there are issues
        if (warnings.length > 0) {
            const result = await Swal.fire({
                title: 'Warning!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>The following issues were found:</strong></p>
                        <ul style="margin-top: 10px;">
                            ${warnings.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                        <p style="margin-top: 15px;">Do you want to proceed anyway?</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, proceed',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) {
                return; // User cancelled
            }
        }

        // Prepare repetition data
        const repetitionData = {
            isRecurring: true,
            recurringType: recurringType,
            repetitions: customerRepetitions
        };

        console.log("=== REPETITION DATA ===");
        console.log("Recurring Type:", recurringType);
        console.log("Number of Repetitions:", numberOfRepetitions);
        console.log("Customer Repetitions:", customerRepetitions);
        console.table(customerRepetitions);

        onConfirm(repetitionData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Event Repetition</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Repetition Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tekrar Türü *
                        </label>
                        <select
                            value={recurringType}
                            onChange={(e) => setRecurringType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                        </select>
                    </div>

                    {/* Number of Repetitions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tekrar Sayısı *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="52"
                            value={numberOfRepetitions}
                            onChange={(e) => setNumberOfRepetitions(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Kaç kez tekrarlanacak?"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Bu etkinlik {numberOfRepetitions} kez {recurringType === 'weekly' ? 'haftalık' : 'aylık'} olarak tekrarlanacak
                        </p>
                    </div>

                    {/* Customer Summary */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">
                            Danışan Özeti ({selectedClients.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedClients.map(client => {
                                const clientId = client._id || client.id;
                                const paymentSettings = customerPaymentSettings[clientId];

                                // Get the selected package for this customer
                                let remainingSessions = 0;
                                let hasPackage = false;
                                let packageName = '';

                                if (paymentSettings?.paymentMethod === 'paketten-tahsil' && paymentSettings?.packageId) {
                                    const clientPackages = customerPackageMap.find(cp => cp.userId === clientId);
                                    const selectedPackage = clientPackages?.userPackages?.find(
                                        pkg => pkg.packageId === paymentSettings.packageId
                                    );

                                    if (selectedPackage) {
                                        hasPackage = true;
                                        remainingSessions = selectedPackage.remainingSessions;
                                        packageName = selectedPackage.packageName;
                                    }
                                }

                                const hasSufficientSessions = remainingSessions >= numberOfRepetitions;

                                return (
                                    <div key={clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-primary-600 text-sm font-medium">
                                                    {client.name?.charAt(0)}{client.surname?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{client.fullName}</p>
                                                {hasPackage ? (
                                                    <>
                                                        <p className={`text-xs ${hasSufficientSessions ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {remainingSessions} seans kaldı
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {packageName}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-red-600">
                                                        {paymentSettings?.paymentMethod === 'paketten-tahsil'
                                                            ? 'Paket seçilmedi'
                                                            : 'Paketten tahsil değil'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {!hasPackage || !hasSufficientSessions ? (
                                            <span className="text-yellow-500 text-xl">⚠️</span>
                                        ) : (
                                            <span className="text-green-500 text-xl">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
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

export default RepetitionModal;