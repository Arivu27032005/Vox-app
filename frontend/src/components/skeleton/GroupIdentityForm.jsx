import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { User, Hash, CheckCircle } from "lucide-react";

const GroupIdentityForm = ({ groupId }) => {
  const { setGroupIdentity } = useChatStore();
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !userId.trim()) return;
    setLoading(true);
    await setGroupIdentity({ groupId, displayName, userId });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 rounded-lg shadow-lg border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 p-5 border-b border-base-300">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-center text-base-content">
                Set Group Identity
              </h2>
              <p className="text-xs text-base-content/60 mt-1">
                How you'll appear to other members
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <User size={14} />
                  Display Name
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Hash size={14} />
                  User ID
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          <button
            className={`btn btn-primary w-full mt-2 gap-2 ${
              (!displayName.trim() || !userId.trim()) && "btn-disabled"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Identity
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupIdentityForm;