
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { adminService } from "./services/AdminServices";
import Swal from 'sweetalert2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Adminactions = () => {
  const [activeTab, setActiveTab] = useState('organization');

  // Kurum Bilgileri state
  const [orgName, setOrgName] = useState('');
  const [orgBio, setOrgBio] = useState('');
  const [orgAbout, setOrgAbout] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');


  // Kullanıcı İşlemleri state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const userId = localStorage.getItem('userId') ;


useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch institution data
      const institution = await adminService.getInstitution(userId);
      if (institution && institution.name) {
        setOrgName(institution.name || '');
        setOrgBio(institution.bio || '');
        setOrgAbout(institution.about || '');
      }

      // Fetch invited users
      const users = await adminService.getInvitedUsers(userId);
      setInvitedUsers(users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);


  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  /**e.target.files is a FileList, like a small array, that contains all the files the user selected.
   * If the user picks 1 file → [ File { name: "mylogo.png", ... } ]
   * If the user picks 2 files → [ File { name: "pic1.jpg" }, File { name: "pic2.jpg" } ]
   * Each item inside .files is a File object, which has properties like name, size, type, etc.
   * [0] means “give me the first file from that Array
   */

  //URL.createObjectURL(file)
  /**Takes the File object you got from <input type="file">
   * Creates a temporary local URL like: blob:http://localhost:3000/9b1d9a90-3c3a-4d21-9f43-6c5b35a1ff3e
   * That URL points to your file stored in browser memory.
   * You can use that URL in an <img> tag to show the image preview:
 */

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };


const handleSaveOrganization = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError('');

    const formdata = new FormData();
    formdata.append('name', orgName);
    formdata.append('bio', orgBio);
    formdata.append('about', orgAbout);
    if (logoFile) formdata.append('logo', logoFile);
    if (coverFile) formdata.append('axe', coverFile);

    console.log('Saving organization...');
    await adminService.updateInstitution(formdata, userId);

    // Clear file inputs after successful save
    setLogoFile(null);
    setCoverFile(null);
    setLogoPreview('');
    setCoverPreview('');

    await Swal.fire({
      icon: 'success',
      title: 'Başarılı!',
      text: 'Kurum bilgileri başarıyla kaydedildi.',
      confirmButtonText: 'Tamam',
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    setError(error.message || 'Kurum bilgileri kaydedilirken hata oluştu.');
    await Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: error.message || 'Kurum bilgileri kaydedilirken hata oluştu.',
      confirmButtonText: 'Tamam',
    });
  } finally {
    setLoading(false);
  }
};


const handleInvite = async (e) => {
  e.preventDefault();
  if (!inviteEmail || !inviteName) {
    setError('Ad ve e-posta adresi gereklidir.');
    await Swal.fire({
      icon: 'warning',
      title: 'Eksik Bilgi',
      text: 'Lütfen ad ve e-posta adresini giriniz.',
      confirmButtonText: 'Tamam',
    });
    return;
  }

  try {
    setLoading(true);
    setError('');

    await adminService.inviteUser(userId, inviteName, inviteEmail);

    // Refresh invited users list
    const users = await adminService.getInvitedUsers(userId);
    setInvitedUsers(users || []);

    setInviteName('');
    setInviteEmail('');

    await Swal.fire({
      icon: 'success',
      title: 'Başarılı!',
      text: 'Davet e-postası başarıyla gönderildi.',
      confirmButtonText: 'Tamam',
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    setError(error.message || 'Davet gönderilirken hata oluştu.');
    await Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: error.message || 'Davet gönderilirken hata oluştu.',
      confirmButtonText: 'Tamam',
    });
  } finally {
    setLoading(false);
  }
};


const handleResend = async (email) => {
  try {
    setLoading(true);
    setError('');

    await adminService.resendInvitation(userId, email);

    // Refresh invited users list
    const users = await adminService.getInvitedUsers(userId);
    setInvitedUsers(users || []);

    await Swal.fire({
      icon: 'success',
      title: 'Başarılı!',
      text: 'Davet e-postası başarıyla yeniden gönderildi.',
      confirmButtonText: 'Tamam',
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    setError(error.message || 'Davet yeniden gönderilirken hata oluştu.');
    await Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: error.message || 'Davet yeniden gönderilirken hata oluştu.',
      confirmButtonText: 'Tamam',
    });
  } finally {
    setLoading(false);
  }
};


const handleRemove = async (id) => {
  const result = await Swal.fire({
    title: 'Emin misiniz?',
    text: 'Bu kullanıcıyı kaldırmak istediğinizden emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Evet, kaldır!',
    cancelButtonText: 'Vazgeç',
  });

  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    setError('');

    await adminService.removeInvitedUser(userId ,id);

    // Refresh invited users list
    const users = await adminService.getInvitedUsers(userId);
    setInvitedUsers(users || []);

    await Swal.fire({
      icon: 'success',
      title: 'Kaldırıldı!',
      text: 'Kullanıcı başarıyla kaldırıldı.',
      confirmButtonText: 'Tamam',
    });
  } catch (error) {
    console.error('Error removing invited user:', error);
    setError(error.message || 'Kullanıcı kaldırılırken hata oluştu.');
    await Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: error.message || 'Kullanıcı kaldırılırken hata oluştu.',
      confirmButtonText: 'Tamam',
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yönetici İşlemleri</h1>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex w-full md:w-auto">
        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'organization' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Kurum Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'users' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Kullanıcı İşlemleri
        </button>
      </div>

      {/* Kurum Bilgileri */}
      {activeTab === 'organization' && (
        <form onSubmit={handleSaveOrganization} encType="multipart/form-data" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kurum Adı</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Örn. Korvo Bilişim A.Ş."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Kısa Açıklama)</label>
              <input
                type="text"
                value={orgBio}
                onChange={(e) => setOrgBio(e.target.value)}
                placeholder="Kısa tanım ekleyin..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hakkında Yazısı</label>
            <textarea
              rows={5}
              value={orgAbout}
              onChange={(e) => setOrgAbout(e.target.value)}
              placeholder="Kurumu detaylıca tanıtın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded object-cover border" />
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-100 border flex items-center justify-center text-gray-400">🏷️</div>
                )}
                <input type="file" name='logo' accept="image/*" onChange={handleLogoChange} className="text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>
              <div className="flex items-center space-x-4">
                {coverPreview ? (
                  <img src={coverPreview} alt="Kapak" className="h-16 w-28 rounded object-cover border" />
                ) : (
                  <div className="h-16 w-28 rounded bg-gray-100 border flex items-center justify-center text-gray-400">🖼️</div>
                )}
                <input type="file" name='axe' accept="image/*" onChange={handleCoverChange} className="text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Kullanıcı İşlemleri */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Takıma Kullanıcı Davet Et</h3>
            <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ad Soyad"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="E-Posta Adresi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Davet Gönder
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Davet Edilen Kullanıcılar</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-Posta</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Davet Tarihi</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitedUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${u.status.includes('Yeniden') ? 'bg-yellow-100 text-yellow-800' : u.status === 'Davet Gönderildi' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {new Date(u.invitedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleResend(u._id)}
                          className="mr-2 text-primary-600 hover:text-primary-700"
                          title="Davet e-postasını yeniden gönder"
                        >
                          Yeniden Gönder
                        </button>
                        <button
                          onClick={() => handleRemove(u._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Kullanıcıyı kaldır"
                        >
                          Kaldır
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
