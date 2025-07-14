import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';

const GroupMessageInput = () => {
  const [text, setText] = useState('');
  const [importantType, setImportantType] = useState(null);
  const [showImportantOptions, setShowImportantOptions] = useState(false);
  const [showStrictScope, setShowStrictScope] = useState(false);

  const { messages, selectedGroup, sendGroupMessage, currentGroupRole, getShouldBlockChat } = useChatStore();
  const { authUser } = useAuthStore();

  if (!selectedGroup) return null;

  const isBlocked = getShouldBlockChat({
    authUserId: authUser._id,
    selectedGroup,
    messages,
  });

  const currentRole = currentGroupRole;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendGroupMessage({
        groupId: selectedGroup._id,
        content: text,
        isImportant: !!importantType,
        importantType: importantType || { type: 'normal', scope: null },
      });

      setText('');
      setImportantType(null);
      setShowImportantOptions(false);
      setShowStrictScope(false);
    } catch (error) {
      console.error(' Failed to send group message', error);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          className="input input-bordered w-full"
          disabled={isBlocked}
          placeholder={
            isBlocked
              ? 'Reply to the important message to continue chatting'
              : 'Type your message here...'
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={isBlocked || text.trim() === ''}
          title="Send"
        >
          <Send size={22} />
        </button>

        {/* Important Message Options */}
        {['Leader', 'Assistant'].includes(currentRole) && (
          <div className="relative">
            <button
              type="button"
              className="btn btn-sm btn-warning mr-2"
              title="Send Important Message"
              onClick={() => {
                setShowImportantOptions(!showImportantOptions);
                setShowStrictScope(false);
              }}
            >
              ⚠️
            </button>

            {/* Dropdown: Important Type */}
            {showImportantOptions && (
              <div className="absolute bottom-12 right-0 bg-base-100 border rounded shadow p-2 z-20 space-y-2">
                <button
                  className="btn btn-xs w-full"
                  onClick={() => {
                    setImportantType('normal');
                    setShowImportantOptions(false);
                  }}
                >
                  Normal
                </button>
                <button
                  className="btn btn-xs w-full"
                  onClick={() => {
                    setShowStrictScope(true);
                    setShowImportantOptions(false);
                  }}
                >
                  Strict
                </button>
              </div>
            )}

            {/* Dropdown: Strict Scope */}
            {showStrictScope && (
              <div className="absolute bottom-12 right-0 bg-base-100 border rounded shadow p-2 z-20 space-y-2">
                <button
                  className="btn btn-xs w-full"
                  onClick={() => {
                    setImportantType({ type: 'strict', scope: 'members' });
                    setShowStrictScope(false);
                  }}
                >
                  Members
                </button>
                <button
                  className="btn btn-xs w-full"
                  onClick={() => {
                    setImportantType({ type: 'strict', scope: 'all' });
                    setShowStrictScope(false);
                  }}
                >
                  All
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Show Current Important Message Type */}
      {importantType && (
        <div
          className={`mt-2 p-2 rounded text-sm flex justify-between items-center
            ${importantType?.type === 'strict'
              ? 'bg-red-100 border border-red-400 text-red-600'
              : 'bg-yellow-100 border border-yellow-400 text-orange-500'
            }`}
        >
          {importantType?.type === 'strict'
            ? `Strict Reply Enabled for (${importantType.scope === 'all' ? 'All' : 'Members'})`
            : 'Normal Important Reply'}
          <button
            onClick={() => setImportantType(null)}
            className="ml-2 text-xs text-blue-600 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupMessageInput;