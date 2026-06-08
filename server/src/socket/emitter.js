let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToRoom = (roomId, event, data) => {
  if (ioInstance) {
    ioInstance.to(roomId).emit(event, data);
  }
};
