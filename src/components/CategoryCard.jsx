import { useState } from "react";
import styles from "../css/CreateRecipe.module.css";
import { createCategory } from "../services/RecipeService";

const CreateCategory = ({
  categories,
  selectedId,
  onSelect,
  onCategoryCreated,
}) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError("");
    try {
      const newCat = await createCategory(name);
      onCategoryCreated(newCat);
      onSelect(newCat.documentId);
      setNewName("");
      setShowNew(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="category_id">
        Category
      </label>
      <div className={styles.inlineRow}>
        <div className={`${styles.selectWrapper} ${styles.grow}`}>
          <select
            id="category_id"
            className={styles.select}
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="">— Select a category —</option>
            {categories.map((cat) => (
              <option key={cat.documentId} value={cat.documentId}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={`${styles.inlineToggleBtn} ${showNew ? styles.active : ""}`}
          onClick={() => {
            setShowNew((v) => !v);
            setError("");
          }}
        >
          {showNew ? "✕ Cancel" : "+ New"}
        </button>
      </div>

      {showNew && (
        <div className={styles.inlineCreateBox}>
          <p className={styles.inlineCreateLabel}>New category name</p>
          <div className={styles.inlineRow}>
            <input
              className={`${styles.input} ${styles.grow}`}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Pasta"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleCreate())
              }
            />
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating ? "…" : "Create"}
            </button>
          </div>
          {error && <p className={styles.inlineError}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CreateCategory;
