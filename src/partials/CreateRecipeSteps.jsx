import styles from "../css/CreateRecipe.module.css";
import StepCard from "../components/StepCard";

const CreateRecipeSteps = ({ steps, onUpdate, onAdd, onRemove }) => (
  <div>
    <p className={styles.sectionLabel}>Recipe Steps</p>

    {steps.map((step, index) => (
      <StepCard
        key={index}
        step={step}
        index={index}
        total={steps.length}
        onUpdate={(field, value) => onUpdate(index, field, value)}
        onRemove={() => onRemove(index)}
      />
    ))}

    <button type="button" className={styles.addBtn} onClick={onAdd}>
      + Add step
    </button>
  </div>
);

export default CreateRecipeSteps;
