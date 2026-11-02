import { useEffect, useState } from "react";

const API_URL = "https://campusconnect-8-d1pg.onrender.com/api";

function Marketplace({ token }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Good",
    contactInfo: "",
  });

  async function loadListings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/listings`);
      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not load books.");
      }

      const books =
        result.data?.listings ??
        result.listings ??
        [];

      setListings(books);
    } catch (err) {
      setError(err.message || "Something went wrong while loading books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError("Please log in before adding a book.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not publish your book.");
      }

      setForm({
        title: "",
        description: "",
        price: "",
        condition: "Good",
        contactInfo: "",
      });

      setShowForm(false);
      await loadListings();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="marketplace-page">
      <div className="marketplace-heading">
        <div>
          <span className="eyebrow">BUY â€¢ SELL â€¢ SHARE</span>
          <h1>Campus marketplace</h1>
          <p>Find useful books and give your old textbooks a new home.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? "Close form" : "+ Add a book"}
        </button>
      </div>

      {showForm && (
        <form className="panel book-form" onSubmit={handleSubmit}>
          <h2>List a textbook</h2>
          <p>Share the details so other students can find your book.</p>

          <label>
            Book title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to Algorithms"
              required
              maxLength={120}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details about the book..."
              required
              maxLength={1000}
            />
          </label>

          <div className="book-form-row">
            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Price in ETB"
                required
              />
            </label>

            <label>
              Condition
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </label>
          </div>

          <label>
            Contact information
            <input
              name="contactInfo"
              value={form.contactInfo}
              onChange={handleChange}
              placeholder="Phone number or preferred contact"
              required
              maxLength={120}
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish book"}
          </button>
        </form>
      )}

      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="notice">Loading marketplace books...</div>
      ) : listings.length === 0 ? (
        <div className="panel marketplace-empty">
          <h2>No books listed yet</h2>
          <p>Be the first student to add a textbook to the marketplace.</p>
        </div>
      ) : (
        <div className="book-grid">
          {listings.map((book) => (
            <article className="panel book-card" key={book._id}>
              <div className="book-cover">
                <span>CampusConnect</span>
                <strong>{book.title}</strong>
                <small>STUDENT MARKETPLACE</small>
              </div>

              <div className="book-card-content">
                <span className="eyebrow">{book.condition}</span>
                <h3>{book.title}</h3>
                <p>{book.description}</p>

                <strong className="book-price">
                  {Number(book.price).toLocaleString()} ETB
                </strong>

                <div className="book-seller">
                  Seller: {book.seller?.name || "CampusConnect student"}
                </div>

                <p className="book-contact">
                  Contact: {book.contactInfo}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Marketplace;
