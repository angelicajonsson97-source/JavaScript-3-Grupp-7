import styles from "../css/CreateRecipe.module.css";

const IngredientCard = ({
  ing,
  index,
  total,
  availableIngredients,
  onUpdate,
  onRemove,
  onSetMode,
  onConfirmNew,
}) => (
  <div className={styles.dynamicCard}>
    <div className={styles.dynamicCardHeader}>
      <span className={styles.dynamicCardTitle}>Ingredient {index + 1}</span>
      <div className={styles.dynamicCardActions}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${ing.mode === "select" ? styles.active : ""}`}
            onClick={() => onSetMode("select")}
          >
            Existing
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${ing.mode === "create" ? styles.active : ""}`}
            onClick={() => onSetMode("create")}
          >
            + New
          </button>
        </div>
        {total > 1 && (
          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </div>

    <div className={styles.fieldRow3}>
      <div className={styles.field}>
        <label className={styles.label}>Ingredient</label>

        {ing.mode === "select" ? (
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={ing.ingredient_id}
              onChange={(e) => onUpdate("ingredient_id", e.target.value)}
            >
              <option value="">— Select —</option>
              {availableIngredients.map((item) => (
                <option key={item.documentId} value={item.documentId}>
                  {item.ingredient_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            {ing.confirmed ? (
              <div className={styles.confirmedPill}>
                ✓ {ing.newName}
                <button
                  type="button"
                  className={styles.pillEdit}
                  onClick={() => onUpdate("confirmed", false)}
                >
                  edit
                </button>
              </div>
            ) : (
              <div className={styles.inlineRow}>
                <input
                  className={`${styles.input} ${styles.grow}`}
                  type="text"
                  value={ing.newName}
                  onChange={(e) => onUpdate("newName", e.target.value)}
                  placeholder="Ingredient name…"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), onConfirmNew())
                  }
                />
                <button
                  type="button"
                  className={styles.confirmBtn}
                  onClick={onConfirmNew}
                  disabled={!ing.newName.trim()}
                >
                  Add
                </button>
              </div>
            )}
            {ing.confirmError && (
              <p className={styles.inlineError}>{ing.confirmError}</p>
            )}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Quantity</label>
        <input
          className={styles.input}
          type="number"
          min="0"
          step="0.01"
          value={ing.quantity}
          placeholder="2"
          onChange={(e) => onUpdate("quantity", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Unit</label>
        <input
          className={styles.input}
          type="text"
          value={ing.unit}
          placeholder="cups, g, tsp…"
          onChange={(e) => onUpdate("unit", e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default IngredientCard;
