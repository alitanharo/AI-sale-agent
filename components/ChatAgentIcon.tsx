
import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon'; // Re-using, or a dedicated chat icon

interface ChatAgentIconProps {
  onClick: () => void;
}

const ChatAgentIcon: React.FC<ChatAgentIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-[#bda77f] hover:bg-[#d6c19a] text-[#1a1a1a] p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#e3d3b3] z-50"
      aria-label="Open Voice Concierge"
    >
      <MicrophoneIcon className="h-8 w-8" />
    </button>
  );
};

export default ChatAgentIcon;
