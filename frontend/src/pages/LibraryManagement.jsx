import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertCircle,
  CheckCircle2,
  BookOpen,
  UserCheck,
  UserPlus,
  Calendar,
  MapPin,
  RotateCcw,
  Info,
  IdCard,
  QrCode,
  Printer
} from 'lucide-react';

const LibraryManagement = () => {
  const { user, hasRole, registerUser } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Alerts
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // --- Catalog (Books) State ---
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookPage, setBookPage] = useState(0);
  const [bookTotalPages, setBookTotalPages] = useState(0);
  const [bookTotalElements, setBookTotalElements] = useState(0);
  const [bookSize] = useState(10);
  
  // Modals for Catalog
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  
  // Book Form Data
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    copiesTotal: 1,
    locationShelf: ''
  });

  // --- Issued Books State ---
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issueSearch, setIssueSearch] = useState('');
  const [issueStatusFilter, setIssueStatusFilter] = useState('ALL'); // ALL, ISSUED, RETURNED, OVERDUE
  
  // Modals for Issuing
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    isbn: '',
    username: '',
    daysToDue: 14
  });

  // --- Librarians State (Admin Only) ---
  const [librarians, setLibrarians] = useState([]);
  const [loadingLibrarians, setLoadingLibrarians] = useState(false);
  const [librarianSearch, setLibrarianSearch] = useState('');
  
  // Modal for Adding Librarian
  const [isAddLibrarianOpen, setIsAddLibrarianOpen] = useState(false);
  const [librarianForm, setLibrarianForm] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    employeeId: '',
    phone: ''
  });

  // --- Library I-Cards State ---
  const [icards, setIcards] = useState([]);
  const [loadingIcards, setLoadingIcards] = useState(false);
  const [icardSearch, setIcardSearch] = useState('');
  
  // Modals for I-Cards
  const [isGenerateCardOpen, setIsGenerateCardOpen] = useState(false);
  const [isViewCardOpen, setIsViewCardOpen] = useState(false);
  const [currentViewCard, setCurrentViewCard] = useState(null);
  const [generateCardForm, setGenerateCardForm] = useState({
    username: '',
    validityYears: 4
  });
  const [eligibleUsers, setEligibleUsers] = useState([]);

  // --- Alert Helper ---
  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- API Calls for Books ---
  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const res = await api.get('/api/library/books', {
        params: {
          query: bookSearch,
          page: bookPage,
          size: bookSize,
          sortBy: 'title',
          sortDir: 'asc'
        }
      });
      setBooks(res.data.content);
      setBookTotalPages(res.data.totalPages);
      setBookTotalElements(res.data.totalElements);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to retrieve books from catalog.');
    } finally {
      setLoadingBooks(false);
    }
  };

  // --- API Calls for Issues ---
  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      const res = await api.get('/api/library/issues');
      setIssues(res.data);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to fetch borrowing history.');
    } finally {
      setLoadingIssues(false);
    }
  };

  // --- API Calls for Librarians (Admin Only) ---
  const fetchLibrarians = async () => {
    if (!hasRole('ROLE_ADMIN')) return;
    try {
      setLoadingLibrarians(true);
      // Fetch users with ROLE_LIBRARIAN query search
      const res = await api.get('/api/users', {
        params: {
          query: 'ROLE_LIBRARIAN',
          page: 0,
          size: 100 // High size to retrieve all librarians in list
        }
      });
      // Further filter locally just in case query matched email or username that contains the role string
      const filtered = res.data.content.filter(u => u.roleName === 'ROLE_LIBRARIAN');
      setLibrarians(filtered);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to retrieve library personnel list.');
    } finally {
      setLoadingLibrarians(false);
    }
  };

  // --- API Calls for I-Cards ---
  const fetchIcards = async () => {
    try {
      setLoadingIcards(true);
      const res = await api.get('/api/library/cards', { params: { query: icardSearch } });
      setIcards(res.data);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to retrieve Library I-Cards.');
    } finally {
      setLoadingIcards(false);
    }
  };

  const fetchEligibleUsers = async (query = '') => {
    try {
      const res = await api.get('/api/library/users/search', { params: { query } });
      setEligibleUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch initial data based on tab
  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchBooks();
    } else if (activeTab === 'issues') {
      fetchIssues();
    } else if (activeTab === 'librarians') {
      fetchLibrarians();
    } else if (activeTab === 'icards') {
      fetchIcards();
    }
  }, [activeTab, bookPage, bookSearch, icardSearch]);

  // --- Book Form Handling ---
  const handleBookInputChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({ 
      ...prev, 
      [name]: name === 'copiesTotal' ? parseInt(value) || 0 : value 
    }));
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/library/books', bookForm);
      setIsAddBookOpen(false);
      showAlert('success', `Book "${bookForm.title}" added to catalog successfully.`);
      fetchBooks();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to add book to catalog.');
    }
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/library/books/${currentBook.id}`, bookForm);
      setIsEditBookOpen(false);
      showAlert('success', `Book "${bookForm.title}" updated successfully.`);
      fetchBooks();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update book.');
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}" from catalog?`)) return;
    try {
      await api.delete(`/api/library/books/${book.id}`);
      showAlert('success', 'Book deleted from catalog successfully.');
      fetchBooks();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const openEditBook = (book) => {
    setCurrentBook(book);
    setBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      copiesTotal: book.copiesTotal,
      locationShelf: book.locationShelf || ''
    });
    setIsEditBookOpen(true);
  };

  const openAddBook = () => {
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      copiesTotal: 1,
      locationShelf: ''
    });
    setIsAddBookOpen(true);
  };

  // --- Issuing & Returns Handling ---
  const handleIssueInputChange = (e) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({ ...prev, [name]: value }));
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/library/issue', issueForm);
      setIsIssueBookOpen(false);
      showAlert('success', 'Book issued successfully.');
      // Refresh current tab data
      if (activeTab === 'issues') {
        fetchIssues();
      } else {
        fetchBooks();
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to issue book.');
    }
  };

  const handleReturnBook = async (issueId) => {
    if (!window.confirm('Are you sure you want to mark this book as returned?')) return;
    try {
      await api.post(`/api/library/return/${issueId}`);
      showAlert('success', 'Book marked as returned successfully.');
      fetchIssues();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to return book.');
    }
  };

  const handlePayFine = async (issueId) => {
    if (!window.confirm('Are you sure you want to mark this fine as paid?')) return;
    try {
      await api.post(`/api/library/pay-fine/${issueId}`);
      showAlert('success', 'Fine marked as paid successfully.');
      fetchIssues();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to record fine payment.');
    }
  };

  const triggerIssueShortcut = (book) => {
    setIssueForm({
      isbn: book.isbn,
      username: '',
      daysToDue: 14
    });
    setIsIssueBookOpen(true);
  };

  // --- Librarian Registration (Admin Only) ---
  const handleLibrarianInputChange = (e) => {
    const { name, value } = e.target;
    setLibrarianForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLibrarianSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        ...librarianForm,
        role: 'ROLE_LIBRARIAN'
      });
      setIsAddLibrarianOpen(false);
      showAlert('success', `Librarian account for "${librarianForm.name}" created successfully.`);
      fetchLibrarians();
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : 'Validation failed. Check inputs.');
    }
  };

  const handleDeleteLibrarian = async (librarian) => {
    if (!window.confirm(`Are you sure you want to delete librarian "${librarian.username}"? This removes their profile and credentials.`)) return;
    try {
      await api.delete(`/api/users/${librarian.id}`);
      showAlert('success', 'Librarian account deleted successfully.');
      fetchLibrarians();
    } catch (err) {
      showAlert('error', 'Failed to delete librarian.');
    }
  };

  const openAddLibrarian = () => {
    setLibrarianForm({
      username: '',
      password: '',
      email: '',
      name: '',
      employeeId: '',
      phone: ''
    });
    setIsAddLibrarianOpen(true);
  };

  // --- Library I-Card Handlers ---
  const handleGenerateCardSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/library/cards/generate', generateCardForm);
      setIsGenerateCardOpen(false);
      showAlert('success', 'Library I-Card generated successfully.');
      fetchIcards();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to generate I-Card.');
    }
  };

  const handleRevokeCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to revoke this Library I-Card? This action cannot be undone easily.')) return;
    try {
      await api.put(`/api/library/cards/${cardId}/revoke`);
      showAlert('success', 'I-Card revoked successfully.');
      fetchIcards();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to revoke I-Card.');
    }
  };

  const openGenerateCardModal = () => {
    setGenerateCardForm({ username: '', validityYears: 4 });
    setEligibleUsers([]);
    setIsGenerateCardOpen(true);
  };

  const openViewCardModal = (card) => {
    setCurrentViewCard(card);
    setIsViewCardOpen(true);
  };

  // --- Filters ---
  const filteredIssues = issues.filter(issue => {
    // Search filter
    const matchesSearch = 
      issue.bookTitle.toLowerCase().includes(issueSearch.toLowerCase()) ||
      issue.bookIsbn.includes(issueSearch) ||
      issue.username.toLowerCase().includes(issueSearch.toLowerCase()) ||
      issue.borrowerName.toLowerCase().includes(issueSearch.toLowerCase());
      
    // Status filter
    if (issueStatusFilter === 'ALL') return matchesSearch;
    if (issueStatusFilter === 'ISSUED') return matchesSearch && issue.status === 'ISSUED';
    if (issueStatusFilter === 'RETURNED') return matchesSearch && issue.status === 'RETURNED';
    if (issueStatusFilter === 'OVERDUE') {
      const isOverdue = issue.status === 'ISSUED' && new Date(issue.dueDate) < new Date();
      return matchesSearch && isOverdue;
    }
    return matchesSearch;
  });

  const filteredLibrarians = librarians.filter(lib => 
    lib.username.toLowerCase().includes(librarianSearch.toLowerCase()) ||
    lib.name.toLowerCase().includes(librarianSearch.toLowerCase()) ||
    lib.email.toLowerCase().includes(librarianSearch.toLowerCase())
  );

  // --- Badge Styling Helpers ---
  const getIssueStatusBadge = (issue) => {
    const isOverdue = issue.status === 'ISSUED' && new Date(issue.dueDate) < new Date();
    if (isOverdue) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-rose-100 text-rose-800 border-rose-200">
          OVERDUE
        </span>
      );
    }
    if (issue.status === 'RETURNED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-800 border-emerald-200">
          RETURNED
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-100 text-amber-800 border-amber-200">
        ISSUED
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Catalog Titles</span>
            <span className="text-2xl font-bold text-slate-800">{activeTab === 'catalog' ? bookTotalElements : '...'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Active Borrowings</span>
            <span className="text-2xl font-bold text-slate-800">
              {issues.filter(i => i.status === 'ISSUED').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Overdue Returns</span>
            <span className="text-2xl font-bold text-slate-800">
              {issues.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < new Date()).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <UserPlus size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Librarian Staff</span>
            <span className="text-2xl font-bold text-slate-800">
              {hasRole('ROLE_ADMIN') ? librarians.length : 'Restricted'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${
            activeTab === 'catalog'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Book Catalog
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${
            activeTab === 'issues'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Issued Records
        </button>
        {hasRole(['ROLE_ADMIN', 'ROLE_LIBRARIAN']) && (
          <button
            onClick={() => setActiveTab('icards')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${
              activeTab === 'icards'
                ? 'border-primary-600 text-primary-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Library I-Cards
          </button>
        )}
        {hasRole('ROLE_ADMIN') && (
          <button
            onClick={() => setActiveTab('librarians')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${
              activeTab === 'librarians'
                ? 'border-primary-600 text-primary-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Librarians Registry
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* CATALOG TAB PANEL */}
      {/* ============================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action and search panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search catalog by title, author, isbn, shelf..."
                value={bookSearch}
                onChange={(e) => { setBookSearch(e.target.value); setBookPage(0); }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            {hasRole('ROLE_LIBRARIAN') && (
              <button
                onClick={openAddBook}
                className="w-full md:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Plus size={16} />
                <span>Add Catalog Book</span>
              </button>
            )}
          </div>

          {/* Book Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">ISBN</th>
                    <th className="px-6 py-4">Title / Author</th>
                    <th className="px-6 py-4">Publisher</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4">Shelf Location</th>
                    {hasRole(['ROLE_LIBRARIAN']) && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loadingBooks ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      </td>
                    </tr>
                  ) : books.length > 0 ? (
                    books.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-600 text-xs">{book.isbn}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{book.title}</div>
                          <div className="text-slate-400 text-xs">By {book.author}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{book.publisher || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${book.copiesAvailable > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="font-semibold text-slate-800">
                              {book.copiesAvailable} / {book.copiesTotal} available
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-medium bg-slate-100 px-2 py-1 rounded">
                            <MapPin size={12} className="text-slate-400" />
                            {book.locationShelf || 'N/A'}
                          </span>
                        </td>
                        {hasRole(['ROLE_LIBRARIAN']) && (
                          <td className="px-6 py-4 text-right space-x-1.5">
                            {book.copiesAvailable > 0 && (
                              <button
                                onClick={() => triggerIssueShortcut(book)}
                                className="px-2.5 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Quick Issue Book"
                              >
                                Issue
                              </button>
                            )}
                            <button
                              onClick={() => openEditBook(book)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600 transition-colors inline-flex items-center"
                              title="Edit Book Info"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center"
                              title="Delete Book"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        No books matching current search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Catalog Pagination Footer */}
            {bookTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
                <span>Showing {books.length} of {bookTotalElements} books</span>
                <div className="flex gap-2">
                  <button
                    disabled={bookPage === 0}
                    onClick={() => setBookPage(p => p - 1)}
                    className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white">
                    Page {bookPage + 1} of {bookTotalPages}
                  </span>
                  <button
                    disabled={bookPage >= bookTotalPages - 1}
                    onClick={() => setBookPage(p => p + 1)}
                    className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ISSUED RECORDS TAB PANEL */}
      {/* ============================================================== */}
      {activeTab === 'issues' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action and filter panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-1 gap-3 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search logs by book, borrower name..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <select
                value={issueStatusFilter}
                onChange={(e) => setIssueStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ISSUED">Currently Issued</option>
                <option value="RETURNED">Returned</option>
                <option value="OVERDUE">Overdue Only</option>
              </select>
            </div>
            {hasRole('ROLE_LIBRARIAN') && (
              <button
                onClick={() => {
                  setIssueForm({ isbn: '', username: '', daysToDue: 14 });
                  setIsIssueBookOpen(true);
                }}
                className="w-full md:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Plus size={16} />
                <span>Issue Catalog Book</span>
              </button>
            )}
          </div>

          {/* Borrowing Logs Data Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Book Details</th>
                    <th className="px-6 py-4">Borrower</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Fine Status</th>
                    <th className="px-6 py-4">Issued By</th>
                    {hasRole('ROLE_LIBRARIAN') && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loadingIssues ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      </td>
                    </tr>
                  ) : filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{issue.bookTitle}</div>
                          <div className="text-slate-400 font-mono text-[10px] uppercase">ISBN: {issue.bookIsbn}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{issue.borrowerName}</div>
                          <div className="text-slate-400 text-xs">@{issue.username}</div>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5">
                          <div><span className="text-slate-400 font-medium">Issued:</span> {new Date(issue.issueDate).toLocaleDateString()}</div>
                          <div><span className="text-slate-400 font-medium">Due:</span> {new Date(issue.dueDate).toLocaleDateString()}</div>
                          {issue.returnDate && (
                            <div className="text-emerald-600 font-medium">
                              <span>Returned:</span> {new Date(issue.returnDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getIssueStatusBadge(issue)}
                        </td>
                        <td className="px-6 py-4">
                          {issue.status === 'ISSUED' && issue.currentFine > 0 && (
                            <span className="text-xs font-bold text-rose-600 block animate-pulse">
                              ₹{issue.currentFine.toFixed(2)} (Overdue)
                            </span>
                          )}
                          {issue.status === 'RETURNED' && issue.fineAmount > 0 && (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                              issue.finePaid 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              ₹{issue.fineAmount.toFixed(2)} {issue.finePaid ? 'Paid' : 'Unpaid'}
                            </span>
                          )}
                          {(!issue.fineAmount || issue.fineAmount === 0) && (!issue.currentFine || issue.currentFine === 0) && (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                          @{issue.issuedByUsername}
                        </td>
                        {hasRole('ROLE_LIBRARIAN') && (
                          <td className="px-6 py-4 text-right space-y-1.5">
                            {issue.status === 'ISSUED' && (
                              <button
                                onClick={() => handleReturnBook(issue.id)}
                                className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 ml-auto active:scale-95"
                              >
                                <RotateCcw size={13} />
                                <span>Mark Returned</span>
                              </button>
                            )}
                            {issue.status === 'RETURNED' && issue.fineAmount > 0 && !issue.finePaid && (
                              <button
                                onClick={() => handlePayFine(issue.id)}
                                className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors flex items-center justify-center gap-1 ml-auto active:scale-95"
                              >
                                <span>Pay Fine</span>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        No issued book records matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LIBRARIANS TAB PANEL (Admin Only) */}
      {/* ============================================================== */}
      {activeTab === 'librarians' && hasRole('ROLE_ADMIN') && (
        <div className="space-y-6 animate-fade-in">
          {/* Action and search panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search staff registry..."
                value={librarianSearch}
                onChange={(e) => setLibrarianSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <button
              onClick={openAddLibrarian}
              className="w-full md:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus size={16} />
              <span>Register Librarian</span>
            </button>
          </div>

          {/* Librarians Registry Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loadingLibrarians ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      </td>
                    </tr>
                  ) : filteredLibrarians.length > 0 ? (
                    filteredLibrarians.map((lib) => (
                      <tr key={lib.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{lib.username}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{lib.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600">{lib.email}</td>
                        <td className="px-6 py-4 text-slate-500">{lib.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteLibrarian(lib)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center"
                            title="Delete Librarian Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        No librarians registered in registry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ICARDS TAB PANEL */}
      {/* ============================================================== */}
      {activeTab === 'icards' && hasRole(['ROLE_ADMIN', 'ROLE_LIBRARIAN']) && (
        <div className="space-y-6 animate-fade-in">
          {/* Action and search panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search I-Cards by Card Number or Username..."
                value={icardSearch}
                onChange={(e) => setIcardSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            {hasRole('ROLE_LIBRARIAN') && (
              <button
                onClick={openGenerateCardModal}
                className="w-full md:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <IdCard size={16} />
                <span>Generate I-Card</span>
              </button>
            )}
          </div>

          {/* I-Cards Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Card No.</th>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Validity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loadingIcards ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      </td>
                    </tr>
                  ) : icards.length > 0 ? (
                    icards.map((card) => (
                      <tr key={card.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{card.cardNumber}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{card.userFullName}</div>
                          <div className="text-slate-400 text-xs">@{card.username} ({card.userRole.replace('ROLE_', '')})</div>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5">
                          <div><span className="text-slate-400 font-medium">Issued:</span> {new Date(card.issueDate).toLocaleDateString()}</div>
                          <div><span className="text-slate-400 font-medium">Valid Till:</span> <span className="font-semibold">{new Date(card.validUntil).toLocaleDateString()}</span></div>
                        </td>
                        <td className="px-6 py-4">
                          {card.status === 'ACTIVE' && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-800 border-emerald-200">ACTIVE</span>}
                          {card.status === 'REVOKED' && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-rose-100 text-rose-800 border-rose-200">REVOKED</span>}
                          {card.status === 'EXPIRED' && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-100 text-amber-800 border-amber-200">EXPIRED</span>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          <button
                            onClick={() => openViewCardModal(card)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors flex-inline items-center gap-1"
                            title="View I-Card"
                          >
                            <IdCard size={13} className="inline mr-1" /> View
                          </button>
                          {card.status === 'ACTIVE' && hasRole('ROLE_LIBRARIAN') && (
                            <button
                              onClick={() => handleRevokeCard(card.id)}
                              className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors flex-inline items-center gap-1"
                              title="Revoke I-Card"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        No I-Cards matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD BOOK MODAL */}
      {/* ============================================================== */}
      {isAddBookOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg flex items-center gap-2">
                <BookOpen className="text-primary-600" size={20} />
                <span>Add Book to Catalog</span>
              </h3>
              <button 
                onClick={() => setIsAddBookOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ISBN Code</label>
                  <input
                    type="text"
                    name="isbn"
                    value={bookForm.isbn}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 978-3-16-148410-0"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Introduction to Algorithms"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Thomas H. Cormen"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={bookForm.publisher}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. MIT Press"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Copies</label>
                  <input
                    type="number"
                    name="copiesTotal"
                    value={bookForm.copiesTotal}
                    onChange={handleBookInputChange}
                    min="1"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shelf Location</label>
                  <input
                    type="text"
                    name="locationShelf"
                    value={bookForm.locationShelf}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Rack A-3"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT BOOK MODAL */}
      {/* ============================================================== */}
      {isEditBookOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg flex items-center gap-2">
                <Edit2 className="text-primary-600" size={20} />
                <span>Modify Book Catalog details</span>
              </h3>
              <button 
                onClick={() => setIsEditBookOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditBookSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ISBN Code (Read-Only)</label>
                  <input
                    type="text"
                    name="isbn"
                    value={bookForm.isbn}
                    disabled
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={bookForm.publisher}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Copies</label>
                  <input
                    type="number"
                    name="copiesTotal"
                    value={bookForm.copiesTotal}
                    onChange={handleBookInputChange}
                    min="1"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shelf Location</label>
                  <input
                    type="text"
                    name="locationShelf"
                    value={bookForm.locationShelf}
                    onChange={handleBookInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditBookOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Update Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ISSUE BOOK MODAL */}
      {/* ============================================================== */}
      {isIssueBookOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                <UserCheck className="text-primary-600" size={18} />
                <span>Issue Book to Borrower</span>
              </h3>
              <button 
                onClick={() => setIsIssueBookOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Book ISBN Code</label>
                <input
                  type="text"
                  name="isbn"
                  value={issueForm.isbn}
                  onChange={handleIssueInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="ISBN Code (e.g. 978-3-16-148410-0)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Borrower Username</label>
                <input
                  type="text"
                  name="username"
                  value={issueForm.username}
                  onChange={handleIssueInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Borrower student/faculty login username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Borrowing Duration (Days)</label>
                <input
                  type="number"
                  name="daysToDue"
                  value={issueForm.daysToDue}
                  onChange={handleIssueInputChange}
                  min="1"
                  max="180"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueBookOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD LIBRARIAN MODAL (Admin Only) */}
      {/* ============================================================== */}
      {isAddLibrarianOpen && hasRole('ROLE_ADMIN') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg flex items-center gap-2">
                <UserPlus className="text-primary-600" size={20} />
                <span>Register New Librarian Account</span>
              </h3>
              <button 
                onClick={() => setIsAddLibrarianOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddLibrarianSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={librarianForm.username}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. lib_sharma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={librarianForm.password}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={librarianForm.name}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Mr. Rajesh Sharma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={librarianForm.employeeId}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. EMP-LIB09"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={librarianForm.phone}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. +91-9876543210"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={librarianForm.email}
                    onChange={handleLibrarianInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. sharma.lib@iit.ac.in"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLibrarianOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Register Librarian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* GENERATE ICARD MODAL */}
      {/* ============================================================== */}
      {isGenerateCardOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg flex items-center gap-2">
                <IdCard className="text-primary-600" size={20} />
                <span>Generate Library I-Card</span>
              </h3>
              <button 
                onClick={() => setIsGenerateCardOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateCardSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search User (Student/Faculty)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={generateCardForm.username}
                    onChange={(e) => {
                      setGenerateCardForm(prev => ({ ...prev, username: e.target.value }));
                      if (e.target.value.length > 2) {
                        fetchEligibleUsers(e.target.value);
                      } else {
                        setEligibleUsers([]);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type username or email to search..."
                    required
                  />
                  {eligibleUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {eligibleUsers.map(u => (
                        <div 
                          key={u.username}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-50 last:border-0"
                          onClick={() => {
                            setGenerateCardForm(prev => ({ ...prev, username: u.username }));
                            setEligibleUsers([]);
                          }}
                        >
                          <div className="font-semibold text-slate-800">{u.username}</div>
                          <div className="text-xs text-slate-500">{u.role.replace('ROLE_', '')} • {u.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Validity Period (Years)</label>
                <select
                  name="validityYears"
                  value={generateCardForm.validityYears}
                  onChange={(e) => setGenerateCardForm(prev => ({ ...prev, validityYears: parseInt(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                >
                  <option value={1}>1 Year (Short Term / Interns)</option>
                  <option value={2}>2 Years (M.Tech / MSc)</option>
                  <option value={4}>4 Years (B.Tech / PhD)</option>
                  <option value={5}>5 Years (Faculty)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateCardOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Generate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW ICARD MODAL (VIRTUAL ID CARD) */}
      {/* ============================================================== */}
      {isViewCardOpen && currentViewCard && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setIsViewCardOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <X size={16} /> Close
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Printer size={16} /> Print Card
            </button>
          </div>

          {/* Virtual ID Card Design */}
          <div className="bg-white w-[340px] h-[520px] rounded-[1.5rem] shadow-2xl relative overflow-hidden border-2 border-slate-100 flex flex-col">
            {/* Card Header Pattern */}
            <div className="h-32 bg-gradient-to-br from-primary-700 to-indigo-900 relative">
              <div className="absolute top-4 w-full text-center">
                <h2 className="text-white font-black tracking-widest text-lg uppercase font-outfit">Library Membership</h2>
                <div className="text-indigo-200 text-xs font-semibold tracking-wider">INDIAN INSTITUTE OF TECHNOLOGY</div>
              </div>
              {/* Decorative circle */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300">
                  <UserCheck className="text-slate-400" size={32} />
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="mt-14 px-6 flex-1 flex flex-col text-center">
              <h3 className="text-xl font-bold text-slate-800">{currentViewCard.userFullName}</h3>
              <p className="text-sm font-medium text-primary-600 mb-1">@{currentViewCard.username}</p>
              
              <div className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 mx-auto">
                {currentViewCard.userRole.replace('ROLE_', '')}
              </div>

              <div className="w-full text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-2 relative">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold text-xs uppercase">Card Number</span>
                  <span className="font-mono font-bold text-slate-800">{currentViewCard.cardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold text-xs uppercase">Valid Till</span>
                  <span className="font-bold text-rose-600">{new Date(currentViewCard.validUntil).toLocaleDateString()}</span>
                </div>
                {currentViewCard.status !== 'ACTIVE' && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                    <span className={`px-4 py-1 text-lg font-black border-4 rounded-xl -rotate-12 ${currentViewCard.status === 'REVOKED' ? 'text-rose-600 border-rose-600' : 'text-amber-500 border-amber-500'}`}>
                      {currentViewCard.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100 mt-auto">
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">Property of</p>
                <p className="text-xs font-bold text-slate-700 leading-tight">Central Library</p>
              </div>
              <QrCode className="text-slate-800" size={42} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default LibraryManagement;
