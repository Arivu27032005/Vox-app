import React, { useState, useMemo, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const ImportantMessageWrapper = ({ messageData }) => {
  const { authUser } = useAuthStore();
  const {
    respondToImportantMessage,
    selectedGroup,
    ignoreImportantMessage,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState("success");
  const [viewBy, setViewBy] = useState("id");
  const [responseText, setResponseText] = useState("");
  const [expandedStates, setExpandedStates] = useState({});
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const wrapperRef = useRef(null);

  const isStrict = messageData.messageType === "StrictReply";
  const isShouldReply = messageData.messageType === "ShouldReply";

  const alreadyIgnored = messageData.ignoredBy?.some(
    (id) => String(id) === String(authUser._id)
  );

  const userResponse = useMemo(() => {
    const responses = messageData.responders?.filter(
      (r) => r.user === authUser._id || r.user?._id === authUser._id
    );
    return responses?.[responses.length - 1] || null;
  }, [messageData.responders, authUser._id]);

  const latestResponses = useMemo(() => {
    const map = new Map();
    for (let r of messageData.responders || []) {
      const userId = r.user?._id || r.user;
      map.set(String(userId), r);
    }
    return Array.from(map.values());
  }, [messageData.responders]);

  const respondersByType = {
    success: latestResponses.filter((r) => r.status?.toLowerCase() === "success"),
    unable: latestResponses.filter((r) => r.status?.toLowerCase() === "unable"),
  };

  const toggleExpand = (userId) => {
    setExpandedStates((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSubmitResponse = async (type) => {
    if (!responseText.trim()) return;
    try {
      await respondToImportantMessage({
        messageId: messageData._id,
        status: type,
        infoMessage: responseText.trim(),
      });
      setResponseText("");
      setIsResubmitting(false);
    } catch (err) {
      console.error("Failed to submit response", err);
    }
  };

  const getMemberDetails = (userId) => {
    return selectedGroup?.members?.find(
      (m) => String(m.user?._id || m.user) === String(userId)
    );
  };

  const canIgnoreMessage = () => {
    const member = getMemberDetails(authUser._id);
    return member?.role === "Leader" || member?.role === "Assistant";
  };

  const handleIgnore = async () => {
    try {
      await ignoreImportantMessage({
        messageId: messageData._id,
        userId: authUser._id,
      });

      const updatedMessages = useChatStore
        .getState()
        .messages.map((msg) =>
          msg._id === messageData._id
            ? {
                ...msg,
                ignoredBy: [...(msg.ignoredBy || []), authUser._id],
              }
            : msg
        );

      useChatStore.setState({ messages: updatedMessages });
    } catch (err) {
      console.error("Ignore failed", err);
    }
  };

  const showInputField = (!userResponse || isResubmitting) && !alreadyIgnored;
  const showIgnoreButton = canIgnoreMessage() && !alreadyIgnored && !userResponse;

  return (
    <div
      ref={wrapperRef}
      className={`relative p-3 rounded-md shadow-md w-full max-w-lg mx-auto mb-3
        ${isStrict ? "bg-red-50 border-l-4 border-red-500" :
          isShouldReply ? "bg-yellow-50 border-l-4 border-yellow-500" :
            "bg-base-100 border"}`}
    >
      {/* Compact header section */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold ${
            isStrict ? "text-red-600" : 
            isShouldReply ? "text-yellow-600" : 
            "text-gray-600"
          }`}>
            {isStrict ? "🚨 STRICT" : isShouldReply ? "📩 SHOULD REPLY" : "📝 MESSAGE"}
          </span>
          <span className="text-xs text-gray-500">
            {messageData.sender?.displayName} • {new Date(messageData.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          Scope: {messageData.strictScope || "All"}
        </span>
      </div>

      {/* Highlighted message content */}
      <div className={`text-sm font-medium px-2 py-1 rounded mb-2 ${
        isStrict ? "bg-red-100 text-red-800" :
        isShouldReply ? "bg-yellow-100 text-yellow-800" :
        "bg-gray-100 text-gray-800"
      }`}>
        {messageData.text}
      </div>

      {/* Compact response input */}
      {showInputField && (
        <div className="mb-2">
          <div className="flex gap-1">
            <input
              type="text"
              className="input input-bordered input-sm w-full text-sm"
              placeholder="Your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <button
              onClick={() => handleSubmitResponse("success")}
              className="btn btn-sm btn-success min-w-fit px-2"
            >
               Success
            </button>
            <button
              onClick={() => handleSubmitResponse("unable")}
              className="btn btn-sm btn-error min-w-fit px-2"
            >
               Unable
            </button>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-between items-center mt-1">
        {showIgnoreButton && (
          <button
            className="btn btn-xs btn-outline btn-warning"
            onClick={handleIgnore}
          >
            🚫 Ignore
          </button>
        )}
        <button
          onClick={() => setIsDropdownVisible((prev) => !prev)}
          className="btn btn-xs ml-auto"
        >
          {isDropdownVisible ? "Hide" : `Responses (${latestResponses.length})`}
        </button>
      </div>

      {/* Response dropdown with resubmit logic */}
      {isDropdownVisible && (
        <div className="absolute left-0 w-full z-50 mt-1 bg-white border border-gray-300 shadow-md rounded p-2 max-h-[280px] overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-1">
              <button 
                className={`btn btn-xs ${activeTab === "success" ? "btn-primary" : "btn-outline"}`} 
                onClick={() => setActiveTab("success")}
              >
                Success ({respondersByType.success.length})
              </button>
              <button 
                className={`btn btn-xs ${activeTab === "unable" ? "btn-primary" : "btn-outline"}`} 
                onClick={() => setActiveTab("unable")}
              >
                Unable ({respondersByType.unable.length})
              </button>
            </div>
            <button 
              className="text-xs underline text-gray-500"
              onClick={() => setViewBy(viewBy === "id" ? "name" : "id")}
            >
              {viewBy === "id" ? "Show Names" : "Show IDs"}
            </button>
          </div>

          <ul className="text-xs space-y-1 max-h-[160px] overflow-y-auto pr-1">
            {respondersByType[activeTab].map((r) => {
              const member = getMemberDetails(r.user._id || r.user);
              return (
                <li key={r._id} className="flex justify-between items-center text-stone-800">
                  <span className="truncate">
                    {expandedStates[r.user._id || r.user]
                      ? r.infoMessage
                      : viewBy === "id"
                        ? member?.userId || "Unknown"
                        : member?.displayName || "Unknown"}
                  </span>
                  <button
                    onClick={() => toggleExpand(r.user._id || r.user)}
                    className="text-xs text-blue-600"
                  >
                    {expandedStates[r.user._id || r.user] ? "▲" : "▼"}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Resubmit button section - restored */}
          <div className="mt-2 flex justify-between">
            {userResponse?.status === "Unable" && !isResubmitting && (
              <button 
                className="btn btn-xs btn-warning"
                onClick={() => {
                  setResponseText("");
                  setIsResubmitting(true);
                }}
              >
                🔁 Resubmit
              </button>
            )}
            <button 
              className="btn btn-xs"
              onClick={() => setIsDropdownVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantMessageWrapper;