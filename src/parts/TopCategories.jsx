import useFetch from "../utils/useFetch";
import styles from "../css/TopCategories.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const TopCategories = () => {
  const { data, loading, error } = useFetch(
    `${API_BASE_URL}/api/categories/top`,
  );
  const topCategories = data[0]?.data ?? [];

  if (loading) return <p className={styles.hint}>Loading top categories…</p>;
  if (error) return <p className={styles.error}>Could not load categories.</p>;
  if (!topCategories.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Top Categories</h2>
      <div className={styles.grid}>
        {topCategories.map((category) => (
          <div key={category.id} className={styles.card}>
            <span className={styles.name}>{category.category_name}</span>
            <span className={styles.count}>{category.recipeCount} recipes</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCategories;
