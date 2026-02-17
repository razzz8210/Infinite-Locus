import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  Trash2, 
  Clock,
  Users,
  LogOut,
  Settings,
  Upload
} from 'lucide-react';
import { Button, Card, Input, Modal, Avatar } from '../components/ui';
import { PageLoader } from '../components/ui/Loader';
import { useAuth, useToast } from '../context';
import api from '../services/api';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [importing, setImporting] = useState(false);
  
  const fileInputRef = useRef(null);

  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/documents', { title: newDocTitle });
      setDocuments([response.data.document, ...documents]);
      setIsCreateModalOpen(false);
      setNewDocTitle('');
      toast.success('Document created!');
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(documents.filter(d => d._id !== docId));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
    setActiveMenu(null);
  };

  // Import document from file
  const handleImportDocument = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'text/markdown', 'text/html', 'application/json'];
    const allowedExtensions = ['.txt', '.md', '.html', '.json'];
    
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      toast.error('Please upload a .txt, .md, .html, or .json file');
      return;
    }

    setImporting(true);
    
    try {
      const text = await file.text();
      let content = text;
      let title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Convert plain text to HTML paragraphs
      if (fileExt === '.txt') {
        content = text.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('');
      }
      
      // Convert markdown to basic HTML
      if (fileExt === '.md') {
        content = text
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/\n/gim, '</p><p>');
        content = `<p>${content}</p>`;
      }

      // Create document with imported content
      const response = await api.post('/documents', { 
        title, 
        content 
      });
      
      setDocuments([response.data.document, ...documents]);
      toast.success(`Imported "${title}" successfully!`);
      navigate(`/document/${response.data.document._id}`);
    } catch (error) {
      toast.error('Failed to import document');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CollabSphere</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.html,.json"
                onChange={handleImportDocument}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                {importing ? (
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span className="ml-2 hidden sm:inline">Import</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<Plus className="w-5 h-5" />}
              >
                New Document
              </Button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar name={user?.name} size="sm" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.name}
                  </span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              <p className="text-sm text-gray-500">Total Documents</p>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.collaborators?.length > 0).length}
              </p>
              <p className="text-sm text-gray-500">Shared Documents</p>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  return new Date(d.updatedAt) > lastWeek;
                }).length}
              </p>
              <p className="text-sm text-gray-500">Updated This Week</p>
            </div>
          </Card>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{filteredDocuments.length} documents</span>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Create your first document to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Document
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc._id}
                hover
                className="group relative"
                onClick={() => navigate(`/document/${doc._id}`)}
              >
                {/* Document Preview */}
                <div className="h-32 bg-gray-50 rounded-lg mb-4 flex items-center justify-center border border-gray-100">
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>

                {/* Document Info */}
                <h3 className="font-medium text-gray-900 mb-1 truncate">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>

                {/* Collaborators */}
                {doc.collaborators && doc.collaborators.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {doc.collaborators.slice(0, 3).map((collab, i) => (
                        <Avatar key={i} name={collab.name} size="xs" />
                      ))}
                    </div>
                    {doc.collaborators.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{doc.collaborators.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Menu */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === doc._id ? null : doc._id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {activeMenu === doc._id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc._id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Document Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Document"
      >
        <div className="space-y-4">
          <Input
            label="Document Title"
            placeholder="Enter document title..."
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} isLoading={creating}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
