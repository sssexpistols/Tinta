// A confirmation applies only to the IDs shown when it opened. A note restored
// in the meantime must survive, as must notes trashed after the confirmation.
export function emptyConfirmedTrash(state, ids) {
  const confirmed = new Set(ids);
  const notes = state.notes.filter(note => !note.deletedAt || !confirmed.has(note.id));
  return {...state, notes, selectedNoteId: notes.some(note => note.id === state.selectedNoteId)
    ? state.selectedNoteId : notes[0]?.id || ''};
}
