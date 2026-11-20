import { db } from '../config/database.js';

export function getGroups(req, res) {
  try {
    const groups = db.getGroups();
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getGroupById(req, res) {
  try {
    const group = db.getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function createGroup(req, res) {
  try {
    const { name, type, description, icon, memberIds, newMembers } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Group name is required' });
    }

    let finalMemberIds = [...(memberIds || [])];

    // If new inline members were passed, create them first
    if (Array.isArray(newMembers) && newMembers.length > 0) {
      newMembers.forEach(m => {
        if (m.name && m.name.trim() !== '') {
          const created = db.createMember(m);
          finalMemberIds.push(created.id);
        }
      });
    }

    const group = db.createGroup({
      name,
      type: type || 'Hostel Room',
      description,
      icon: icon || '🏠',
      memberIds: finalMemberIds
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function updateGroup(req, res) {
  try {
    const updated = db.updateGroup(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getMembers(req, res) {
  try {
    const members = db.getMembers();
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function createMember(req, res) {
  try {
    const { name, avatar, upiId, email, phone } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Member name is required' });
    }
    const member = db.createMember({ name, avatar, upiId, email, phone });
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
