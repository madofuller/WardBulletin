import { X, Users, UserPlus, Eye, Edit, Crown } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Ward Sharing is Here!
            </h2>
            <p className="text-sm text-gray-600 mt-1">Collaborate with your team on bulletin creation</p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* What is Ward Sharing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What is Ward Sharing?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Ward Sharing allows you to invite others to help create and manage your ward's bulletins.
                You can give them different levels of access based on what they need to do.
              </p>
            </div>

            {/* Three Roles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Understanding Roles
              </h3>
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Crown className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Owner (You)</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Full control over everything - create bulletins, manage QR codes, invite users, and control all settings.
                    </p>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Edit className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Editor</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Can create, edit, schedule, and delete bulletins. Perfect for ward clerks or assistants who help prepare bulletins.
                    </p>
                  </div>
                </div>

                {/* Viewer */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Eye className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Viewer</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Read-only access. Great for bishopric members, leaders, or anyone who needs to review bulletins but shouldn't edit them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Share */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How to Share Your Ward
              </h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Click your email in the top right corner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Select <strong>"Share Profile"</strong> from the menu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>Click <strong>"Invite New User"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                  <span>Enter their email address and choose their role (Editor or Viewer)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</span>
                  <span>They'll receive an email invitation to join!</span>
                </li>
              </ol>
            </div>

            {/* Switching Wards */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                For Shared Users
              </h4>
              <p className="text-sm text-purple-800">
                If someone shares their ward with you, click the <strong>Share</strong> button at the top right
                to open the QR Code section. Then use the <strong>Active Profile</strong> dropdown
                at the top to switch between wards you have access to.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <button
            onClick={() => onClose(true)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Don't show again
          </button>
          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
