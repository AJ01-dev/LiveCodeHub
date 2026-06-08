// Matches server nanoid alphabet: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (8 chars)
const ROOM_ID_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

const extractIdFromPath = (pathname) => {
  const match = pathname.match(/\/room\/([A-HJ-NP-Z2-9]{8})\/?$/i);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Parse a room ID from a plain ID or a full/partial room URL.
 * @returns {{ roomId: string|null, error: string|null }}
 */
export const parseRoomId = (input) => {
  const trimmed = input?.trim();
  if (!trimmed) {
    return { roomId: null, error: 'Please enter a room ID or room link' };
  }

  // Full or partial URL (contains path separators)
  if (trimmed.includes('/') || trimmed.includes('://')) {
    try {
      const url = trimmed.startsWith('http')
        ? new URL(trimmed)
        : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'http://localhost');

      const roomId = extractIdFromPath(url.pathname);
      if (roomId && ROOM_ID_PATTERN.test(roomId)) {
        return { roomId, error: null };
      }
      return {
        roomId: null,
        error: 'Invalid room link. Use format: http://host/room/ROOM_ID',
      };
    } catch {
      return { roomId: null, error: 'Invalid room link format' };
    }
  }

  // Plain room ID
  const roomId = trimmed.toUpperCase().replace(/\s/g, '');
  if (!ROOM_ID_PATTERN.test(roomId)) {
    return {
      roomId: null,
      error: 'Invalid room ID. Must be 8 characters (e.g. CU2DJ2V)',
    };
  }

  return { roomId, error: null };
};
