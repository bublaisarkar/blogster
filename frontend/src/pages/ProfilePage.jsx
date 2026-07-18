import { useState, useRef, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ProfilePage = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // ✅ Helper function to create profile data from user
  const getProfileData = (userData) => {
    if (!userData) return null;

    return {
      name: userData.name || '',
      username: userData.username || userData.email?.split('@')[0] || '',
      bio: userData.bio || '',
      location: userData.location || '',
      joined: userData.joined || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      avatar: userData.avatar || '',
      socialLinks: {
        twitter: userData.socialLinks?.twitter || '',
        github: userData.socialLinks?.github || '',
        linkedin: userData.socialLinks?.linkedin || '',
        website: userData.socialLinks?.website || ''
      }
    };
  };

  // ✅ Initialize state with null (will be set when the user starts editing)
  const [formData, setFormData] = useState(null);

  const currentUserProfile = useMemo(() => getProfileData(user), [user]);
  const profile = formData || currentUserProfile;

  const handleToggleEdit = () => {
    if (!isEditing) {
      setFormData(getProfileData(user));
    } else {
      setFormData(null);
    }
    setIsEditing(prev => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socialLinks: formData.socialLinks
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        await refreshUser();
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(getProfileData(user));
    setIsEditing(false);
  };

  // ✅ Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      const { data } = await axios.post('/auth/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        const updatedUser = {
          ...user,
          avatar: data.data.avatar
        };

        const result = await updateProfile(updatedUser);

        if (result && result.success !== false) {
          toast.success('Avatar updated successfully!');

          // Update local formData with new avatar
          setFormData(prev => ({
            ...prev,
            avatar: data.data.avatar
          }));

          await refreshUser();

          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          toast.error(result?.message || 'Failed to update avatar');
        }
      } else {
        toast.error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload avatar';
      toast.error(message);
      console.error('Avatar upload error:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  // ✅ Loading state
  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-[#6b6b84]">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Avatar URL
  const avatarUrl = profile.avatar
    ? profile.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=4f46e5&color=fff&size=150`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Page */}
      <div className="mt-6">

        {/* Cover Image */}
        <div className="relative rounded-3xl overflow-hidden">
          <img
            alt="Cover"
            className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover"
          />
          <button
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
            onClick={() => toast('Cover photo feature coming soon!', { icon: '🎨' })}
          >
            <i className="fas fa-camera"></i> Edit Cover
          </button>
        </div>

        {/* Profile Card */}
        <div className="relative bg-white rounded-2xl border border-[#edebf5] shadow-sm mt-[-40px] mx-4 sm:mx-6 p-6 sm:p-8 lg:p-10">

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-20 sm:-mt-24 pt-4 sm:pt-6">
            {/* Profile Image with Upload */}
            <div className="profile-image-wrapper flex-shrink-0 relative group">
              <img
                src={avatarUrl}
                alt={profile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label
                htmlFor="profile-image-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                {avatarLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                ) : (
                  <div className="flex flex-col items-center">
                    <i className="fas fa-camera text-white text-2xl"></i>
                    <span className="text-white text-[10px] mt-1 font-medium">Change</span>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="profile-image-upload"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
            </div>

            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">{profile.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                  <i className="fas fa-check-circle"></i> Verified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#6b6b84]">
                  <i className="fas fa-map-marker-alt text-indigo-500"></i> {profile.location || 'No location set'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#6b6b84]">
                  <i className="fas fa-calendar-alt text-indigo-500"></i> Joined {profile.joined}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleToggleEdit}
                className="border border-[#e6e6ed] hover:bg-[#faf9f6] px-3 sm:px-4 py-2 rounded-xl transition text-sm flex items-center gap-2"
              >
                <i className="fas fa-pen"></i>
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
              <button className="border border-[#e6e6ed] hover:bg-[#faf9f6] px-3 sm:px-4 py-2 rounded-xl transition text-sm flex items-center gap-2">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm flex items-center gap-2 ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
              <i className={`fas ${message.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {message}
            </div>
          )}

          {/* ✅ Location Display Section */}
          {profile.location && (
            <div className="mt-6 pt-6 border-t border-[#f0eef8]">
              <h3 className="text-sm font-semibold text-[#6b6b84] uppercase tracking-wider mb-2">Location</h3>
              <p className="text-[#2d2d3f] flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-indigo-500"></i>
                {profile.location}
              </p>
            </div>
          )}

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-[#f0eef8]">
            <h3 className="text-sm font-semibold text-[#6b6b84] uppercase tracking-wider mb-2">Bio</h3>
            <p className="text-[#2d2d3f] leading-relaxed">{profile.bio || 'No bio yet'}</p>
          </div>

          {/* Social Links */}
          <div className="mt-6 pt-6 border-t border-[#f0eef8]">
            <h3 className="text-sm font-semibold text-[#6b6b84] uppercase tracking-wider mb-3">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#2d2d3f] bg-[#faf9f6] px-4 py-2 rounded-xl hover:bg-[#f0eff5] transition">
                  <i className="fab fa-twitter text-[#1DA1F2]"></i> Twitter
                </a>
              )}
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#2d2d3f] bg-[#faf9f6] px-4 py-2 rounded-xl hover:bg-[#f0eff5] transition">
                  <i className="fab fa-github text-[#24292e]"></i> GitHub
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#2d2d3f] bg-[#faf9f6] px-4 py-2 rounded-xl hover:bg-[#f0eff5] transition">
                  <i className="fab fa-linkedin-in text-[#0A66C2]"></i> LinkedIn
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#2d2d3f] bg-[#faf9f6] px-4 py-2 rounded-xl hover:bg-[#f0eff5] transition">
                  <i className="fas fa-globe text-[#6b6b84]"></i> Website
                </a>
              )}
              {!profile.socialLinks?.twitter && !profile.socialLinks?.github && !profile.socialLinks?.linkedin && !profile.socialLinks?.website && (
                <p className="text-sm text-[#6b6b84]">No social links added yet</p>
              )}
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="mt-8 pt-8 border-t border-[#f0eef8]">
              <h3 className="text-lg font-bold text-[#14141f] mb-4 flex items-center gap-2">
                <i className="fas fa-pen text-indigo-600"></i> Edit Profile
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData?.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData?.location || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Bio</label>
                  <textarea
                    name="bio"
                    value={formData?.bio || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Social Links</label>
                  <div className="relative">
                    <i className="fab fa-twitter absolute left-4 top-1/2 -translate-y-1/2 text-[#1DA1F2]"></i>
                    <input
                      type="url"
                      name="twitter"
                      value={formData?.socialLinks?.twitter || ''}
                      onChange={handleSocialChange}
                      placeholder="Twitter URL"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  <div className="relative">
                    <i className="fab fa-github absolute left-4 top-1/2 -translate-y-1/2 text-[#24292e]"></i>
                    <input
                      type="url"
                      name="github"
                      value={formData?.socialLinks?.github || ''}
                      onChange={handleSocialChange}
                      placeholder="GitHub URL"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  <div className="relative">
                    <i className="fab fa-linkedin-in absolute left-4 top-1/2 -translate-y-1/2 text-[#0A66C2]"></i>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData?.socialLinks?.linkedin || ''}
                      onChange={handleSocialChange}
                      placeholder="LinkedIn URL"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  <div className="relative">
                    <i className="fas fa-globe absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b84]"></i>
                    <input
                      type="url"
                      name="website"
                      value={formData?.socialLinks?.website || ''}
                      onChange={handleSocialChange}
                      placeholder="Website URL"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Update Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-xl border border-[#e6e6ed] bg-white hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;