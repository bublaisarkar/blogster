import SettingsInput from './SettingsInput';
import SettingsButton from './SettingsButton';

const SecurityTab = ({ data, onChange, onSubmit, loading }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#14141f] mb-6">Change Password</h2>
      
      <form className="space-y-5" onSubmit={onSubmit}>
        <SettingsInput 
          label="Current Password" 
          name="currentPassword"
          type="password"
          value={data.currentPassword}
          onChange={onChange}
          placeholder="Enter your current password"
          icon="fa-lock"
        />
        
        <SettingsInput 
          label="New Password" 
          name="newPassword"
          type="password"
          value={data.newPassword}
          onChange={onChange}
          placeholder="Enter new password"
          icon="fa-key"
          helper="Must be at least 8 characters"
        />
        
        <SettingsInput 
          label="Confirm New Password" 
          name="confirmPassword"
          type="password"
          value={data.confirmPassword}
          onChange={onChange}
          placeholder="Confirm your new password"
          icon="fa-check-circle"
        />
        
        <div className="pt-2">
          <SettingsButton type="submit" loading={loading}>
            <i className="fas fa-key mr-2"></i> Update Password
          </SettingsButton>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;