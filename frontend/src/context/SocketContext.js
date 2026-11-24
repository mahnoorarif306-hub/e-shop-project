import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

const SOCKET_ORIGIN =
  process.env.REACT_APP_SOCKET_URL || window.location.origin;

export const SocketProvider = ({ children }) => {
  const socket = useMemo(
    () =>
      io(SOCKET_ORIGIN, {
        path: "/api/socket",
        transports: ["websocket"],
        autoConnect: true,
      }),
    []
  );

  useEffect(() => () => socket.disconnect(), [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};