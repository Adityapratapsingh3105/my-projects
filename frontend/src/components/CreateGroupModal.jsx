import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { X, Users, Plus, Check, Sparkles } from 'lucide-react';

export default function CreateGroupModal() {
  const { 
    isCreateGroupOpen, 
    setIsCreateGroupOpen, 
    members, 
    refreshAll, 
    showToast,
    openGroupDetail 
  } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState('Hostel Room');
  const [icon, setIcon] = useState('🏠');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(members.slice(0, 3).map(m => m.id));

  // Inline new friend
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendUpi, setNewFriendUpi] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateGroupOpen) return null;

  const emojiList = ['🏠', '🏖️', '🛒', '🍕', '🚗', '📚', '⚡', '🎉', '🎸', '☕', '🏕️', '✈️'];

  const toggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) {
        showToast('At least one member is required', 'error');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleAddNewFriend = async (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    try {
      const res = await api.createMember({
        name: newFriendName.trim(),
        upiId: newFriendUpi.trim() || `${newFriendName.toLowerCase().replace(/\s+/g, '')}@okupi`,
        avatar: '👤'
      });
      if (res.success && res.data) {
        setSelectedMemberIds([...selectedMemberIds, res.data.id]);
        setNewFriendName('');
        setNewFriendUpi('');
        setShowAddFriend(false);
        await refreshAll();
        showToast(`Added ${res.data.name} to members!`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }
    if (selectedMemberIds.length === 0) {
      showToast('Please select at least one group member', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createGroup({
        name: name.trim(),
        type,
        icon,
        description: description.trim(),
        memberIds: selectedMemberIds
      });

      if (res.success && res.data) {
        await refreshAll();
        showToast(`Group "${res.data.name}" created!`);
        setIsCreateGroupOpen(false);
        openGroupDetail(res.data.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0f1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Group</h3>
              <p className="text-xs text-slate-400">Hostel room, weekend trip, or flat</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateGroupOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Group Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Group Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {emojiList.map(em => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setIcon(em)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center shrink-0 border transition-all ${
                    icon === em 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-105' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Room 304, Manali Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Group Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="Hostel Room">Hostel Room</option>
                <option value="Trip">Trip / Vacation</option>
                <option value="Flat / Apartment">Flat / Apartment</option>
                <option value="Food & Canteen">Food & Canteen</option>
                <option value="Project / Team">Project / Team</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="What are these expenses for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Select Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Select Members ({selectedMemberIds.length} added)
              </label>
              <button
                type="button"
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Friend
              </button>
            </div>

            {/* Inline Add Friend Form */}
            {showAddFriend && (
              <div className="p-3 mb-3 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                <p className="font-semibold text-emerald-400">Add New Hostel Friend</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Friend's full name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="UPI ID (e.g. karan@paytm)"
                    value={newFriendUpi}
                    onChange={(e) => setNewFriendUpi(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFriend(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewFriend}
                    className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {members.map(m => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{m.avatar}</span>
                    <span className="truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
