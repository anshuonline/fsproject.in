import React, { useState, useEffect } from 'react';
import { X, Check, ListMusic } from 'lucide-react';
import { useContextMenu } from '../../context/ContextMenuContext';
import { useLibrary } from '../../context/LibraryContext';
import './EditPlaylistModal.css';

export function EditPlaylistModal() {
  const { isEditModalOpen, editingPlaylist, closeEditPlaylistModal, showToast } = useContextMenu();
  const { updatePlaylist, saveExternalPlaylist } = useLibrary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingPlaylist) {
      setName(editingPlaylist.name || editingPlaylist.title || '');
      setDescription(editingPlaylist.description || '');
    }
  }, [editingPlaylist]);

  if (!isEditModalOpen || !editingPlaylist) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Playlist name cannot be empty', 'error');
      return;
    }

    const isCustom = editingPlaylist.id && (editingPlaylist.id.startsWith('pl-'));

    if (isCustom) {
      updatePlaylist(editingPlaylist.id, {
        name: trimmedName,
        description: description.trim()
      });
      showToast('Playlist updated successfully!', 'success');
    } else {
      const saved = saveExternalPlaylist({
        ...editingPlaylist,
        title: trimmedName,
        name: trimmedName,
        description: description.trim()
      });
      if (saved) {
        showToast('Created editable copy in your Library!', 'success');
      }
    }

    closeEditPlaylistModal();
  };

  return (
    <div className="fs-modal-backdrop" onClick={closeEditPlaylistModal}>
      <div className="fs-edit-playlist-card" onClick={(e) => e.stopPropagation()}>
        <div className="fs-modal-header">
          <div className="fs-modal-header-title">
            <ListMusic size={22} className="text-brand" />
            <h3>Edit playlist details</h3>
          </div>
          <button
            type="button"
            className="btn-icon fs-modal-close-btn"
            onClick={closeEditPlaylistModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fs-modal-form">
          <div className="fs-form-group">
            <label htmlFor="edit-pl-name">Title</label>
            <input
              id="edit-pl-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give your playlist a title"
              maxLength={80}
              autoFocus
              className="fs-input"
            />
          </div>

          <div className="fs-form-group">
            <label htmlFor="edit-pl-desc">Description (optional)</label>
            <textarea
              id="edit-pl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description"
              maxLength={250}
              rows={3}
              className="fs-textarea"
            />
          </div>

          <div className="fs-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeEditPlaylistModal}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
