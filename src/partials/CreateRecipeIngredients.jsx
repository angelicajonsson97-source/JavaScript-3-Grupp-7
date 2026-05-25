import styles from "../css/CreateRecipe.module.css";
import IngredientCard from "../components/IngredientCard";

const CreateRecipeIngredients = ({
  ingredients,
  availableIngredients,
  onUpdate,
  onAdd,
  onRemove,
  onSetMode,
  onConfirmNew,
}) => (
  <div>
    <p className={styles.sectionLabel}>Ingredients</p>

    {ingredients.map((ing, index) => (
      <IngredientCard
        key={index}
        ing={ing}
        index={index}
        total={ingredients.length}
        availableIngredients={availableIngredients}
        onUpdate={(field, value) => onUpdate(index, field, value)}
        onRemove={() => onRemove(index)}
        onSetMode={(mode) => onSetMode(index, mode)}
        onConfirmNew={() => onConfirmNew(index)}
      />
    ))}

    <button type="button" className={styles.addBtn} onClick={onAdd}>
      + Add ingredient
    </button>
  </div>
);

export default CreateRecipeIngredients;
