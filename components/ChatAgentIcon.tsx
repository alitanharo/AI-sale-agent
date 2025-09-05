
import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon'; // Re-using, or a dedicated chat icon

interface ChatAgentIconProps {
  onClick: () => void;
}

const ChatAgentIcon: React.FC<ChatAgentIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300 z-50"
      aria-label="Open Voice Assistant"
    >
      <MicrophoneIcon className="h-8 w-8" />
    </button>
  );
};

export default ChatAgentIcon;
