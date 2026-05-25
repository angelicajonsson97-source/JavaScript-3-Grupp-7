import styles from "../css/CreateRecipe.module.css";

const StepCard = ({ step, index, total, onUpdate, onRemove }) => (
  <div className={styles.dynamicCard}>
    <div className={styles.dynamicCardHeader}>
      <span className={styles.dynamicCardTitle}>Step {index + 1}</span>
      {total > 1 && (
        <button type="button" className={styles.removeBtn} onClick={onRemove}>
          Remove
        </button>
      )}
    </div>

    <div className={styles.fieldRow}>
      <div className={styles.field}>
        <label className={styles.label}>Step number</label>
        <input
          className={styles.input}
          type="number"
          min="1"
          value={step.step_number}
          placeholder={index + 1}
          onChange={(e) => onUpdate("step_number", e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Step image</label>
        <div className={styles.fileUploadSmall}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onUpdate("image", e.target.files?.[0] ?? null)}
          />
          <span>{step.image ? `📎 ${step.image.name}` : "Optional image"}</span>
        </div>
      </div>
    </div>

    <div className={styles.field}>
      <label className={styles.label}>
        Instruction <span className={styles.required}>*</span>
      </label>
      <textarea
        className={styles.textarea}
        rows={3}
        value={step.instruction}
        placeholder="Describe what to do in this step…"
        onChange={(e) => onUpdate("instruction", e.target.value)}
      />
    </div>
  </div>
);

export default StepCard;
