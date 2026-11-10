/**
 * Bentuk satu object resep dari TheMealDB API.
 * TheMealDB mengirim bahan dan takaran sebagai strIngredient1..20
 * dan strMeasure1..20, sehingga index signature dipakai untuk membacanya.
 */
export interface TheMealDBMeal {
  [key: string]: string | null;
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
  strSource: string | null;
}

/** Bentuk response JSON dari endpoint TheMealDB. */
export interface TheMealDBResponse {
  meals: TheMealDBMeal[] | null;
}
