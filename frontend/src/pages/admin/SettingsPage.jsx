import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import SecurityTab from '../../components/dashboard/settings/SecurityTab';

const SettingsPage = () => {
  const { updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Load settings – runs once
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // ✅ Security handler
  const handleSecurityChange = useCallback((e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  }, []);

  // ✅ Security submit
  const handleSecuritySubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSecurityLoading) return;
    
    if (!securityData.currentPassword) {
      toast.error('Current password is required!');
      return;
    }
    
    if (!securityData.newPassword) {
      toast.error('New password is required');
      return;
    }
    
    if (securityData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setIsSecurityLoading(true);

    try {
      const result = await updatePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });

      if (result.success) {
        toast.success(result.message || 'Password updated successfully!');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSecurityLoading(false);
    }
  }, [securityData, updatePassword, isSecurityLoading]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-[#6b6b84]">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Security Settings</h1>
          <p className="text-[#6b6b84] text-sm">Manage your password and security preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <SecurityTab 
            data={securityData}
            onChange={handleSecurityChange}
            onSubmit={handleSecuritySubmit}
            loading={isSecurityLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;