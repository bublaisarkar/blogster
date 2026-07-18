import ToggleSwitch from './ToggleSwitch';

const NotificationsTab = ({ notifications, onToggle }) => {
  const notificationItems = {
    newComments: {
      label: 'New Comments',
      description: 'Get notified when someone comments on your posts'
    },
    newFollowers: {
      label: 'New Followers',
      description: 'Get notified when someone follows you'
    },
    blogUpdates: {
      label: 'Blog Updates',
      description: 'Get notified about blog performance and analytics'
    },
    emailDigest: {
      label: 'Email Digest',
      description: 'Weekly email summary of your blog activity'
    },
    marketingEmails: {
      label: 'Marketing Emails',
      description: 'Receive promotional offers and updates'
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#14141f] mb-6">Notification Preferences</h2>
      <div className="space-y-4">
        {Object.entries(notificationItems).map(([key, item]) => (
          <ToggleSwitch
            key={key}
            checked={notifications[key]}
            onChange={() => onToggle(key)}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsTab;