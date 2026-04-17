import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

async function apiFetch(path, options = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const emptyRegister = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  address: '',
  password: '',
  role: 'student',
  date_of_birth: '',
  university_affiliation: '',
  major: '',
  student_status: '',
  current_year_of_study: '',
  gender: '',
  salary: '',
  aadhaar_number: '',
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('books');

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const me = await apiFetch('/auth/me', {}, token);
        setUser(me);
      } catch {
        setToken('');
        setUser(null);
      }
    };
    loadMe();
  }, [token]);

  if (!token || !user) {
    return <AuthPage setToken={setToken} setUser={setUser} />;
  }

  return (
    <div className="container">
      <div className="card title">
        <div>
          <h2 style={{ margin: 0 }}>GyanPustak</h2>
          <div className="small">
            Logged in as {user.first_name} {user.last_name}
          </div>
        </div>
        <div className="small badge">{user.role}</div>
      </div>

      <nav>
        <button className={page === 'books' ? 'active' : ''} onClick={() => setPage('books')}>
          Books
        </button>
        {(user.role === 'administrator' || user.role === 'super_admin') && (
          <button className={page === 'employees' ? 'active' : ''} onClick={() => setPage('employees')}>
            Employees
          </button>
        )}
        {user.role === 'student' && (
  <>
    <button className={page === 'cart' ? 'active' : ''} onClick={() => setPage('cart')}>
      Cart
    </button>
    <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>
      Orders
    </button>
    <button className={page === 'reviews' ? 'active' : ''} onClick={() => setPage('reviews')}>
      Reviews
    </button>
  </>
)}

{(user.role === 'customer_support' || user.role === 'super_admin') && (
  <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>
    Orders
  </button>
)}
        <button className={page === 'tickets' ? 'active' : ''} onClick={() => setPage('tickets')}>
          Tickets
        </button>
        <button className={page === 'courses' ? 'active' : ''} onClick={() => setPage('courses')}>
          Courses
        </button>
        <button
          className="secondary"
          onClick={() => {
            setToken('');
            setUser(null);
            localStorage.clear();
          }}
        >
          Logout
        </button>
      </nav>

      {page === 'books' && <BooksPage token={token} user={user} />}
      {page === 'employees' && <EmployeesPage token={token} user={user} />}
      {page === 'cart' && <CartPage token={token} />}
      {page === 'orders' && <OrdersPage token={token} user={user} />}
      {page === 'reviews' && <ReviewsPage token={token} user={user} />}
      {page === 'tickets' && <TicketsPage token={token} user={user} />}
      {page === 'courses' && <CoursesPage token={token} user={user} />}
    </div>
  );
}

function AuthPage({ setToken, setUser }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ ...emptyRegister });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    try {
      if (mode === 'register') {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMessage('Registered successfully. Please login.');
        setMode('login');
      } else {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <h1>GyanPustak</h1>
          <p>Manage books, orders, courses and more in one place.</p>
        </div>

        <div className="auth-right">
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>

          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}

          <div className="switch-btns">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Login
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <div className="row">
                  <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} />
                  <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} />
                </div>

                <div className="row">
                  <input name="phone_number" placeholder="Phone number" value={form.phone_number} onChange={handleChange} />
                  <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                </div>

                <div className="row">
                  <select disabled>
                    <option>Student</option>
                  </select>
                </div>
              </>
            )}

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <div className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button className="primary-btn" type="submit">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function BooksPage({ token, user }) {
  const [q, setQ] = useState('');
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: '', isbn: '', publisher: '', publication_date: '', edition_number: '',
    language: '', book_type: '', purchase_option: '', format: '', price: '',
    quantity: '', category: '', subcategory: '', authors: '', keywords: ''
  });

  const canEdit = user.role === 'administrator' || user.role === 'super_admin';
  const canAddToCart = user.role === 'student';

  const load = async () => {
    const data = await apiFetch(`/books?q=${encodeURIComponent(q)}`, {}, token);
    setBooks(data);
  };

  useEffect(() => {
    load().catch(() => { });
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      authors: form.authors ? form.authors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      keywords: form.keywords ? form.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    await apiFetch('/books', { method: 'POST', body: JSON.stringify(payload) }, token);
    setForm({
      title: '', isbn: '', publisher: '', publication_date: '', edition_number: '',
      language: '', book_type: '', purchase_option: '', format: '', price: '',
      quantity: '', category: '', subcategory: '', authors: '', keywords: ''
    });
    await load();
  };

  const addToCart = async (bookId) => {
    await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId, quantity: 1 }),
    }, token);
    alert('Added to cart');
  };

  return (
    <div className="card">
      <div className="title">
        <h3>Books</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search books" value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={load}>Search</button>
        </div>
      </div>

      {canEdit && (
        <form onSubmit={submit} className="card" style={{ marginTop: 12 }}>
          <h4>Add Book</h4>
          <div className="grid3">
            <input name="title" placeholder="Title" value={form.title} onChange={change} />
            <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={change} />
            <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={change} />
            <input name="publication_date" type="date" value={form.publication_date} onChange={change} />
            <input name="edition_number" placeholder="Edition" value={form.edition_number} onChange={change} />
            <input name="language" placeholder="Language" value={form.language} onChange={change} />
            <input name="book_type" placeholder="Book type" value={form.book_type} onChange={change} />
            <input name="purchase_option" placeholder="Purchase option" value={form.purchase_option} onChange={change} />
            <input name="format" placeholder="Format" value={form.format} onChange={change} />
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={change} />
            <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={change} />
            <input name="category" placeholder="Category" value={form.category} onChange={change} />
            <input name="subcategory" placeholder="Subcategory" value={form.subcategory} onChange={change} />
            <input name="authors" placeholder="Authors comma separated" value={form.authors} onChange={change} />
            <input name="keywords" placeholder="Keywords comma separated" value={form.keywords} onChange={change} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">Save Book</button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>ISBN</th>
              <th>Publisher</th>
              <th>Purchase Option</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Category</th>
              <th>Subcategory</th>
              {canAddToCart && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.book_id}>
                <td>{b.title}</td>
                <td>{b.isbn}</td>
                <td>{b.publisher}</td>
                <td>{b.purchase_option}</td>
                <td>{b.price}</td>
                <td>{b.quantity}</td>
                <td>{b.category}</td>
                <td>{b.subcategory}</td>
                {canAddToCart && (
                  <td>
                    {user.role === 'student' && (
                      <button onClick={() => addToCart(b.book_id)}>
                        Add to cart
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeesPage({ token, user }) {
  const [q, setQ] = useState('');
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    gender: '',
    salary: '',
    aadhaar_number: '',
    role: 'customer_support'
  });

  const load = async () => {
    const data = await apiFetch(`/employees/search?q=${encodeURIComponent(q)}`, {}, token);
    setEmployees(data);
  };

  useEffect(() => {
    load().catch(() => { });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createEmployee = async () => {
    await apiFetch('/admin/employees', {
      method: 'POST',
      body: JSON.stringify(form)
    }, token);

    alert('Employee created');
    await load();
  };

  return (
    <div className="card">
      <div className="title">
        <h3>Employees</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search employees" value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={load}>Search</button>
        </div>
      </div>

      {user.role === 'super_admin' && (
        <div className="card">
          <h4>Add Employee</h4>

          <div className="grid3">
            <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} />
            <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            <input name="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
            <input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} />
            <input name="aadhaar_number" placeholder="Aadhaar" value={form.aadhaar_number} onChange={handleChange} />

            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer_support">Customer Support</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          <button style={{ marginTop: 10 }} onClick={createEmployee}>
            Create Employee
          </button>
        </div>
      )}

      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Gender</th><th>Salary</th><th>Aadhaar</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.person_id}>
              <td>{e.first_name} {e.last_name}</td>
              <td>{e.email}</td>
              <td>{e.gender}</td>
              <td>{e.salary}</td>
              <td>{e.aadhaar_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CartPage({ token }) {
  const [cart, setCart] = useState(null);
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await apiFetch('/cart', {}, token);
    setCart(data);
  };

  useEffect(() => {
    load().catch(() => { });
  }, []);

  const addItem = async () => {
    await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId, quantity: 1 }),
    }, token);
    setBookId('');
    await load();
  };

  const removeItem = async (book_id) => {
    if (!window.confirm('Remove this item from cart?')) return;
    setLoading(true);
    try {
      await apiFetch(`/cart/items/${book_id}`, { method: 'DELETE' }, token);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    await apiFetch('/orders/checkout', { method: 'POST' }, token);
    alert('Order placed');
    await load();
  };

  return (
    <div className="card">
      <h3>Cart</h3>
      <div className="row">
        <input placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} />
        <button onClick={addItem}>Add item</button>
      </div>
      <button style={{ marginTop: 12 }} onClick={checkout}>Checkout</button>

      <table style={{ marginTop: 12 }}>
        <thead>
          <tr><th>Book</th><th>Qty</th><th>Price</th><th>Action</th></tr>
        </thead>
        <tbody>
          {(cart?.items || []).map((item) => (
            <tr key={item.book_id}>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>
                <button className="secondary" disabled={loading} onClick={() => removeItem(item.book_id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersPage({ token, user }) {
  const [orders, setOrders] = useState([]);
  const [statusForm, setStatusForm] = useState({ order_id: '', status: '' });
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const isStaff = user && (user.role === 'customer_support' || user.role === 'super_admin');

  const load = async () => {
    const url = isStaff ? '/orders/all' : '/orders';
    const data = await apiFetch(url, {}, token);
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!token || !user) return;
    load().catch(() => {});
  }, [token, user]);

  const loadOrderDetails = async (orderId) => {
    if (!orderId) {
      setOrderDetails(null);
      return;
    }
    const data = await apiFetch(`/orders/${orderId}`, {}, token);
    setOrderDetails(data);
  };

  const updateStatus = async () => {
    if (!isStaff) return;
    if (!statusForm.order_id || !statusForm.status) {
      alert('Select order ID and status');
      return;
    }

    await apiFetch(`/orders/${statusForm.order_id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: statusForm.status }),
    }, token);

    setStatusForm({ order_id: '', status: '' });
    await load();
    if (String(selectedOrderId) === String(statusForm.order_id)) {
      await loadOrderDetails(statusForm.order_id);
    }
  };

  const returnRentalItem = async (orderId, bookId) => {
    await apiFetch(`/orders/${orderId}/items/${bookId}/return`, {
      method: 'PUT',
    }, token);
    await loadOrderDetails(orderId);
    await load();
  };

  const getAllowedStatuses = (currentStatus) => {
    const s = String(currentStatus || '').toLowerCase();
    if (s === 'new') return ['processed', 'canceled'];
    if (s === 'processed') return ['awaiting shipping', 'canceled'];
    if (s === 'awaiting shipping') return ['shipped', 'canceled'];
    if (s === 'shipped') return ['delivered'];
    return [];
  };

  const selectedOrder = orders.find(
    (o) => String(o.order_id) === String(statusForm.order_id)
  );

  return (
    <div className="card">
      <h3>Orders</h3>

      {isStaff && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="row">
            <input
              placeholder="Order ID"
              value={statusForm.order_id}
              onChange={(e) =>
                setStatusForm({ ...statusForm, order_id: e.target.value })
              }
            />
            <select
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm({ ...statusForm, status: e.target.value })
              }
            >
              <option value="">Select Status</option>
              {getAllowedStatuses(selectedOrder?.order_status).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={updateStatus}>Update Order Status</button>
            <button className="secondary" onClick={load}>Reload</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Enter order ID to view details"
          value={selectedOrderId}
          onChange={(e) => setSelectedOrderId(e.target.value)}
        />
        <button onClick={() => loadOrderDetails(selectedOrderId)}>View Details</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Student</th>
            <th>Status</th>
            <th>Date Created</th>
            <th>Date Fulfilled</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.order_id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedOrderId(o.order_id);
                loadOrderDetails(o.order_id);
              }}
            >
              <td>{o.order_id}</td>
              <td>{o.first_name ? `${o.first_name} ${o.last_name}` : o.student_id}</td>
              <td>{o.order_status}</td>
              <td>{o.date_created ? new Date(o.date_created).toLocaleString() : '-'}</td>
              <td>{o.date_fulfilled ? new Date(o.date_fulfilled).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {orderDetails && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4>Order Details</h4>
          <div className="small">
            Order ID: {orderDetails.order.order_id} | Status: {orderDetails.order.order_status}
          </div>

          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Book</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Rental Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item) => (
                <tr key={item.book_id}>
                  <td>{item.title}</td>
                  <td>{item.purchase_option}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_price_at_purchase}</td>
                  <td>{item.rental_status || '-'}</td>
                  <td>{item.rental_due_date ? new Date(item.rental_due_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {item.is_rental &&
                      (item.rental_status === 'rented' || item.rental_status === 'overdue') && (
                        <button onClick={() => returnRentalItem(orderDetails.order.order_id, item.book_id)}>
                          Return
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function ReviewsPage({ token }) {
  const [bookId, setBookId] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const add = async () => {
    setMessage('');

    if (!bookId) {
      setMessage('Please enter Book ID');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          book_id: Number(bookId),
          rating: Number(rating),
          review_text: reviewText
        }),
      }, token);

      setMessage('Review saved');
      setReviewText('');

      await load(); 
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    setMessage('');

    if (!bookId) {
      setReviews([]);
      setMessage('Enter a Book ID to load reviews.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch(`/reviews/book/${bookId}`, {}, token);
      const safeData = Array.isArray(data) ? data : [];

      setReviews(safeData);

      if (!safeData.length) {
        setMessage('No reviews found for this book.');
      }
    } catch (err) {
      setReviews([]);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Reviews</h3>

      <div className="row">
        <input
          placeholder="Book ID"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </div>

      <textarea
        placeholder="Review text"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={add} disabled={loading}>
          Save Review
        </button>

        <button className="secondary" onClick={load} disabled={loading}>
          Load Reviews
        </button>
      </div>

      {message && (
        <div className="small" style={{ marginTop: 10 }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {reviews.map((r) => (
          <div className="card" key={r.review_id}>
            <b>{r.first_name} {r.last_name}</b> - Rating {r.rating}
            <div>{r.review_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketsPage({ token, user }) {
  const [form, setForm] = useState({ category: '', title: '', problem_description: '' });
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState({ id: '', newStatus: '', assigned_admin_id: '' });
  const [historyTicketId, setHistoryTicketId] = useState('');
  const [history, setHistory] = useState([]);
  const [admins, setAdmins] = useState([]);

  const canCreateTicket = user.role === 'student';
  const canUpdateTickets =
    user.role === 'customer_support' ||
    user.role === 'administrator' ||
    user.role === 'super_admin';

  const load = async () => {
    const data = await apiFetch('/tickets', {}, token);
    setTickets(data);
  };

  useEffect(() => {
    load().catch(() => { });

    if (user.role === 'customer_support') {
      apiFetch('/employees/search?q=', {}, token)
        .then((data) => {
          const adminsOnly = (Array.isArray(data) ? data : []).filter(
            (e) => String(e.role).toLowerCase() === 'administrator'
          );
          setAdmins(adminsOnly);
        })
        .catch(() => { });
    }
  }, [token, user]);

  const create = async () => {
    await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify(form)
    }, token);

    setForm({ category: '', title: '', problem_description: '' });
    await load();
  };

  const change = async () => {
    if (!status.id || !status.newStatus) {
      alert('Provide ticket ID and status');
      return;
    }

    if (user.role === 'customer_support' && !status.assigned_admin_id) {
      alert('Please select an admin');
      return;
    }

    await apiFetch(`/tickets/${status.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: status.newStatus,
        assigned_admin_id: status.assigned_admin_id || null,
        solution_description: 'Updated via UI'
      })
    }, token);

    setStatus({ id: '', newStatus: '', assigned_admin_id: '' });
    await load();
  };

  const loadHistory = async () => {
    if (!historyTicketId) {
      setHistory([]);
      alert('Enter a ticket ID first');
      return;
    }
    const data = await apiFetch(`/tickets/${historyTicketId}/history`, {}, token);
    setHistory(Array.isArray(data) ? data : []);
  };

  const getAllowedStatuses = (currentStatus) => {
    if (user.role === 'customer_support') {
      return currentStatus === 'new' ? ['assigned'] : [];
    }

    if (user.role === 'administrator' || user.role === 'super_admin') {
      if (currentStatus === 'assigned') return ['in-process'];
      if (currentStatus === 'in-process') return ['closed'];
      return [];
    }

    return [];
  };

  const selectedTicket = tickets.find(
    (t) => String(t.ticket_id) === String(status.id)
  );

  return (
    <div className="card">
      <h3>Tickets</h3>

      {canCreateTicket && (
        <>
          <div className="grid3">
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Problem description"
              value={form.problem_description}
              onChange={(e) =>
                setForm({ ...form, problem_description: e.target.value })
              }
            />
          </div>
          <button style={{ marginTop: 8 }} onClick={create}>
            Create Ticket
          </button>
        </>
      )}

      {canUpdateTickets && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="row">
            <input
              placeholder="Ticket ID"
              value={status.id}
              onChange={(e) => {
                const value = e.target.value;
                setStatus({ ...status, id: value });
                setHistoryTicketId(value);
              }}
            />

            <select
              value={status.newStatus}
              onChange={(e) =>
                setStatus({ ...status, newStatus: e.target.value })
              }
            >
              <option value="">Select Status</option>
              {getAllowedStatuses(selectedTicket?.current_status).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {user.role === 'customer_support' && status.newStatus === 'assigned' && (
            <select
              value={status.assigned_admin_id}
              onChange={(e) =>
                setStatus({ ...status, assigned_admin_id: e.target.value })
              }
            >
              <option value="">Select Admin</option>
              {admins.map((a) => (
                <option key={a.person_id} value={a.person_id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={change}>Update Status</button>
            <button className="secondary" onClick={loadHistory}>
              Load History
            </button>
          </div>
        </div>
      )}

      <h4>Tickets</h4>
      {tickets.map((t) => (
        <div key={t.ticket_id} className="card">
          <b>#{t.ticket_id}</b> {t.title}{' '}
          <span className="badge">{t.current_status}</span>
          <div className="small">{t.problem_description}</div>
        </div>
      ))}

      {history.length > 0 && (
        <>
          <h4>Status History</h4>
          {history.map((h) => (
            <div key={h.history_id} className="card">
              {h.old_status} → {h.new_status} at{' '}
              {new Date(h.changed_at).toLocaleString()}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function CoursesPage({ token, user }) {
  const [offerings, setOfferings] = useState([]);
  const [courseForm, setCourseForm] = useState({ course_name: '', university_id: '' });
  const [offeringForm, setOfferingForm] = useState({ course_id: '', department_id: '', instructor_id: '', academic_year: '', semester: '' });
  const canEdit = user.role === 'administrator' || user.role === 'super_admin';

  const load = async () => {
    const data = await apiFetch('/courses/offering', {}, token);
    setOfferings(data);
  };

  useEffect(() => {
    load().catch(() => { });
  }, []);

  const addCourse = async () => {
    await apiFetch('/courses', { method: 'POST', body: JSON.stringify(courseForm) }, token);
    alert('Course created');
  };

  const addOffering = async () => {
    await apiFetch('/courses/offering', { method: 'POST', body: JSON.stringify(offeringForm) }, token);
    alert('Course offering created');
    await load();
  };

  return (
    <div className="card">
      <h3>Courses & Offerings</h3>
      {canEdit && (
        <>
          <div className="card">
            <h4>Add Course</h4>
            <div className="row">
              <input placeholder="Course name" value={courseForm.course_name} onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} />
              <input placeholder="University ID" value={courseForm.university_id} onChange={(e) => setCourseForm({ ...courseForm, university_id: e.target.value })} />
            </div>
            <button style={{ marginTop: 8 }} onClick={addCourse}>Save Course</button>
          </div>

          <div className="card">
            <h4>Add Course Offering</h4>
            <div className="grid3">
              <input placeholder="Course ID" value={offeringForm.course_id} onChange={(e) => setOfferingForm({ ...offeringForm, course_id: e.target.value })} />
              <input placeholder="Department ID" value={offeringForm.department_id} onChange={(e) => setOfferingForm({ ...offeringForm, department_id: e.target.value })} />
              <input placeholder="Instructor ID" value={offeringForm.instructor_id} onChange={(e) => setOfferingForm({ ...offeringForm, instructor_id: e.target.value })} />
              <input placeholder="Academic year" value={offeringForm.academic_year} onChange={(e) => setOfferingForm({ ...offeringForm, academic_year: e.target.value })} />
              <input placeholder="Semester" value={offeringForm.semester} onChange={(e) => setOfferingForm({ ...offeringForm, semester: e.target.value })} />
            </div>
            <button style={{ marginTop: 8 }} onClick={addOffering}>Save Offering</button>
          </div>
        </>
      )}

      <table>
        <thead>
          <tr><th>Offering ID</th><th>Course</th><th>Instructor</th><th>Year</th><th>Semester</th></tr>
        </thead>
        <tbody>
          {offerings.map((o) => (
            <tr key={o.offering_id}>
              <td>{o.offering_id}</td>
              <td>{o.course_name}</td>
              <td>{o.instructor_first_name} {o.instructor_last_name}</td>
              <td>{o.academic_year}</td>
              <td>{o.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}