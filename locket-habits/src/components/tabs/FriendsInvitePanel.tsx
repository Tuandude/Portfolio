import React, { useState } from 'react';
import { UserPlus, Copy, Check, Users, X } from 'lucide-react';
import type { UserProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { HapticService } from '../../services/haptic';
import { SoundService } from '../../services/sound';

interface FriendsInvitePanelProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

export const FriendsInvitePanel: React.FC<FriendsInvitePanelProps> = ({
  profile,
  onProfileChange,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.inviteCode);
      SoundService.playPop();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-HTTPS or denied)
    }
  };

  const handleAddFriend = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Nhập mã bạn bè trước nhé!');
      HapticService.error();
      return;
    }
    // Basic format validation: LK-XXXX
    if (!/^LK-[A-Z0-9]{4}$/.test(code)) {
      setErrorMsg('Mã không hợp lệ. Định dạng: LK-XXXX');
      HapticService.error();
      return;
    }
    const added = StorageService.addFriendCode(code);
    if (!added) {
      setErrorMsg(
        code === profile.inviteCode
          ? 'Không thể thêm mã của chính bạn!'
          : 'Mã này đã trong danh sách bạn bè rồi.'
      );
      HapticService.error();
      return;
    }
    SoundService.playSuccess();
    HapticService.checkboxComplete();
    setSuccessMsg(`Đã kết nối bạn bè ${code}! 🎉`);
    setInputCode('');
    onProfileChange(StorageService.getProfile());
  };

  const handleRemoveFriend = (code: string) => {
    SoundService.playClick();
    StorageService.removeFriendCode(code);
    onProfileChange(StorageService.getProfile());
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1A1A20] rounded-3xl brutal-border brutal-shadow p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#3A86FF] text-white brutal-border brutal-shadow-sm flex items-center justify-center">
          <Users size={16} strokeWidth={2.5} />
        </div>
        <span className="font-black text-sm text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">
          Kết Nối Bạn Bè
        </span>
      </div>

      {/* My invite code */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          Mã Mời Của Bạn
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 bg-[#FFF3B0] dark:bg-[#2A2617] brutal-border rounded-xl flex items-center justify-between">
            <span className="font-black text-xl tracking-widest text-[#18181B] dark:text-[#FFD166]">
              {profile.inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-white dark:bg-[#1A1A20] brutal-border brutal-shadow-sm flex items-center gap-1 text-[10px] font-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform"
              title="Sao chép mã mời"
            >
              {copied ? (
                <Check size={13} className="text-green-500" />
              ) : (
                <Copy size={13} />
              )}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép!' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
          Chia sẻ mã này để bạn bè nhập và xem locket của nhau theo thời gian thực.
        </p>
      </div>

      {/* Add friend by code */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          Nhập Mã Bạn Bè
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="LK-XXXX"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              setErrorMsg('');
              setSuccessMsg('');
            }}
            maxLength={7}
            className="flex-1 px-3 py-2 bg-white dark:bg-[#23232C] dark:text-white brutal-border rounded-xl text-sm font-black placeholder:text-gray-400 placeholder:font-bold focus:outline-none tracking-widest uppercase"
          />
          <button
            type="button"
            onClick={handleAddFriend}
            className="px-3 py-2 bg-[#3A86FF] text-white brutal-border brutal-shadow-sm rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-600 active:scale-95 transition-transform"
          >
            <UserPlus size={14} /> Thêm
          </button>
        </div>
        {errorMsg && (
          <p className="text-[11px] font-bold text-red-500">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-[11px] font-bold text-green-600 dark:text-green-400">{successMsg}</p>
        )}
      </div>

      {/* Friends list */}
      {profile.friendCodes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
            Bạn Bè ({profile.friendCodes.length})
          </span>
          <div className="flex flex-col gap-1">
            {profile.friendCodes.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between px-3 py-1.5 bg-[#D8F3DC] dark:bg-[#153426] brutal-border rounded-xl"
              >
                <span className="font-black text-sm tracking-widest text-[#18181B] dark:text-[#52B788]">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFriend(code)}
                  className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                  title="Xóa bạn"
                >
                  <X size={11} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
