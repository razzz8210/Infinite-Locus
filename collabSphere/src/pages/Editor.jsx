import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Clock, 
  CheckCircle,
  Cloud,
  CloudOff,
  History,
  Share2,
  Copy,
  Link,
  UserPlus,
  Mail,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExt from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button, Input, Modal, Avatar, Card } from '../components/ui';
import { AvatarGroup } from '../components/ui/Avatar';
import { PageLoader, InlineLoader } from '../components/ui/Loader';
import { useAuth, useToast } from '../context';
import { socketService } from '../services/socket';
import api from '../services/api';

// Toolbar Button Component
const ToolbarButton = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
    }`}
  >
    {children}
  </button>
);

// Toolbar Divider
const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // Document state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Collaboration state
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Save state
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  
  // Version history
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Share modal
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  
  // Refs for debouncing
  const saveTimeoutRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      
      const html = editor.getHTML();
      handleContentChange(html);
    },
  });

  // Fetch document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        setDocument(response.data.document);
        setLastSaved(new Date(response.data.document.updatedAt));
        
        // Set initial content
        if (editor && response.data.document.content) {
          editor.commands.setContent(response.data.document.content);
        }
      } catch (error) {
        toast.error('Failed to load document');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (editor) {
      fetchDocument();
    }
  }, [id, editor]);

  // Socket connection
  useEffect(() => {
    if (!document || !user) return;

    socketService.connect();
    socketService.joinDocument(id, user);

    socketService.onUserJoined((users) => {
      setActiveUsers(users);
    });

    socketService.onUserLeft((users) => {
      setActiveUsers(users);
    });

    socketService.onContentChange((data) => {
      if (data.userId !== user._id && editor) {
        isRemoteUpdate.current = true;
        const currentPos = editor.state.selection.anchor;
        editor.commands.setContent(data.content, false);
        // Try to restore cursor position
        try {
          editor.commands.setTextSelection(currentPos);
        } catch (e) {
          // Position might be invalid after content change
        }
      }
    });

    socketService.onUserTyping((data) => {
      if (data.userId !== user._id) {
        setTypingUsers((prev) => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
        
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId));
        }, 2000);
      }
    });

    socketService.onDocumentSaved(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    });

    return () => {
      socketService.leaveDocument(id);
      socketService.disconnect();
    };
  }, [document, user, id, editor]);

  // Auto-save functionality
  const saveDocument = useCallback(async (newContent) => {
    setSaveStatus('saving');
    try {
      await api.put(`/documents/${id}`, { content: newContent });
      socketService.saveDocument(id, newContent);
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to save');
    }
  }, [id, toast]);

  // Handle content change
  const handleContentChange = (newContent) => {
    setSaveStatus('unsaved');

    socketService.emitTyping(id, user);
    socketService.emitContentChange(id, newContent, user._id);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(newContent);
    }, 2000);
  };

  // Fetch version history
  const fetchVersionHistory = async () => {
    setLoadingVersions(true);
    try {
      const response = await api.get(`/documents/${id}/versions`);
      setVersions(response.data.versions);
    } catch (error) {
      toast.error('Failed to load version history');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restore version
  const handleRestoreVersion = async (versionId) => {
    try {
      const response = await api.post(`/documents/${id}/versions/${versionId}/restore`);
      if (editor) {
        editor.commands.setContent(response.data.document.content);
      }
      setIsHistoryOpen(false);
      toast.success('Version restored');
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !editor) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">
                  {document?.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Saved {lastSaved && formatTime(lastSaved)}</span>
                    </>
                  )}
                  {saveStatus === 'saving' && (
                    <>
                      <Cloud className="w-3 h-3 text-blue-500 animate-pulse" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === 'unsaved' && (
                    <>
                      <Cloud className="w-3 h-3 text-yellow-500" />
                      <span>Unsaved changes</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <CloudOff className="w-3 h-3 text-red-500" />
                      <span>Save failed</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </span>
                  <span>
                    {typingUsers.map(u => u.userName).join(', ')} typing...
                  </span>
                </div>
              )}

              {/* Active Users */}
              {activeUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <AvatarGroup users={activeUsers.map(u => ({ id: u.oduserId, name: u.userName }))} max={4} />
                  <span className="text-sm text-gray-500">
                    {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'}
                  </span>
                </div>
              )}

              <div className="h-6 w-px bg-gray-200" />

              {/* Version History */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsHistoryOpen(true);
                  fetchVersionHistory();
                }}
              >
                <History className="w-4 h-4 mr-1" />
                History
              </Button>

              {/* Share */}
              <Button variant="ghost" size="sm" onClick={() => setIsShareOpen(true)}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>

              {/* Save */}
              <Button
                size="sm"
                onClick={() => saveDocument(editor.getHTML())}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <main className="flex-1 flex justify-center py-8">
        <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg border border-gray-200 min-h-[calc(100vh-250px)]">
          <EditorContent 
            editor={editor} 
            className="prose max-w-none p-8 min-h-[500px] focus:outline-none"
          />
        </div>
      </main>

      {/* Cursor Indicators */}
      {activeUsers.filter(u => u.oduserId !== user._id).map((activeUser) => (
        <div
          key={activeUser.oduserId}
          className="fixed pointer-events-none z-50"
          style={{ 
            left: activeUser.cursorPosition?.x || -100,
            top: activeUser.cursorPosition?.y || -100,
          }}
        >
          <div className="flex items-center gap-1">
            <div 
              className="w-0.5 h-5 rounded-full animate-pulse"
              style={{ backgroundColor: activeUser.color || '#3B82F6' }}
            />
            <span 
              className="text-xs px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: activeUser.color || '#3B82F6' }}
            >
              {activeUser.userName}
            </span>
          </div>
        </div>
      ))}

      {/* Version History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Version History"
        size="lg"
      >
        <div className="max-h-96 overflow-y-auto">
          {loadingVersions ? (
            <div className="py-8 text-center">
              <InlineLoader text="Loading versions..." />
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No version history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <Card
                  key={version._id}
                  padding="sm"
                  className="flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {index === 0 ? 'Current Version' : `Version ${versions.length - index}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(version.createdAt)} by {version.createdBy?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version._id)}
                    >
                      Restore
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Document"
        size="md"
      >
        <div className="space-y-6">
          {/* Copy Link Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              Document Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with anyone who has an account to collaborate
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Add Collaborator Section */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserPlus className="w-4 h-4 inline mr-1" />
              Add Collaborator by Email
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
              <Button
                onClick={async () => {
                  if (!shareEmail.trim()) {
                    toast.error('Please enter an email');
                    return;
                  }
                  setAddingCollaborator(true);
                  try {
                    await api.post(`/documents/${id}/collaborators`, { 
                      email: shareEmail,
                      role: 'editor'
                    });
                    toast.success(`Invited ${shareEmail} as collaborator!`);
                    setShareEmail('');
                    const response = await api.get(`/documents/${id}`);
                    setDocument(response.data.document);
                  } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to add collaborator');
                  } finally {
                    setAddingCollaborator(false);
                  }
                }}
                isLoading={addingCollaborator}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Current Collaborators */}
          {document?.collaborators && document.collaborators.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Collaborators ({document.collaborators.length})
              </label>
              <div className="space-y-2">
                {document.collaborators.map((collab, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar name={collab.user?.name || 'User'} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {collab.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{collab.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {collab.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Editor;
