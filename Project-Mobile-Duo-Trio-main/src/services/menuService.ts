import type { TheMealDBMeal, TheMealDBResponse } from "@/types/api";
import type { MenuItem } from "@/data/menuData";

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const INITIAL_LETTERS = ["a", "b", "c"];

/**
 * Mengambil resep dari TheMealDB menggunakan custom Promise.
 * resolve() dipanggil jika seluruh request berhasil.
 * reject() dipanggil jika HTTP request atau parsing response gagal.
 * .then() dan .catch() menunjukkan alur penyelesaian Promise.
 */
function requestMeals(): Promise<TheMealDBMeal[]> {
  return new Promise<TheMealDBMeal[]>((resolve, reject) => {
    Promise.all(
      INITIAL_LETTERS.map((letter) =>
        fetch(`${API_BASE_URL}/search.php?f=${letter}`).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          return response.json() as Promise<TheMealDBResponse>;
        })
      )
    )
      .then((responses) => {
        const meals = responses.flatMap((result) => result.meals ?? []);
        const uniqueMeals = Array.from(
          new Map(meals.map((meal) => [meal.idMeal, meal])).values()
        );

        if (uniqueMeals.length === 0) {
          reject(new Error("TheMealDB tidak mengembalikan data resep."));
          return;
        }

        resolve(uniqueMeals);
      })
      .catch((error: unknown) => {
        reject(
          error instanceof Error
            ? error
            : new Error("Terjadi kesalahan saat mengambil data TheMealDB.")
        );
      });
  });
}

/**
 * Endpoint pencarian nama resep dari TheMealDB.
 * Dipakai saat pengguna mengirim kata kunci pencarian.
 */
function requestMealsByName(query: string): Promise<TheMealDBMeal[]> {
  return new Promise<TheMealDBMeal[]>((resolve, reject) => {
    fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json() as Promise<TheMealDBResponse>;
      })
      .then((data) => resolve(data.meals ?? []))
      .catch((error: unknown) => {
        reject(
          error instanceof Error
            ? error
            : new Error("Pencarian resep gagal dilakukan.")
        );
      });
  });
}

/** Mengambil pasangan bahan dan takaran dari field bernomor milik API. */
function getIngredients(meal: TheMealDBMeal): string[] {
  const ingredients: string[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push(measure ? `${ingredient} — ${measure}` : ingredient);
    }
  }

  return ingredients;
}

/** Mengubah kategori TheMealDB menjadi kategori yang digunakan aplikasi. */
function mapCategory(category: string | null): MenuItem["category"] {
  const normalizedCategory = (category ?? "").toLowerCase();
  if (["dessert", "side", "starter"].includes(normalizedCategory)) {
    return "Camilan";
  }
  return "Makanan";
}

/**
 * Mengubah object resep dari API menjadi model MenuItem milik aplikasi.
 * TheMealDB tidak menyediakan harga, rating, atau kalori.
 * Harga di bawah adalah harga simulasi lokal agar fitur keranjang/checkout demo
 * tetap berfungsi; bukan data yang dikirim oleh API.
 */
function mapMealsToMenu(meals: TheMealDBMeal[]): MenuItem[] {
  return meals.map((meal) => {
    const category = mapCategory(meal.strCategory);
    const ingredients = getIngredients(meal);
    const descriptionParts = [
      meal.strArea ? `Masakan khas ${meal.strArea}.` : "Resep dari TheMealDB.",
      meal.strInstructions?.replace(/\s+/g, " ").trim().slice(0, 150) ?? "Lihat detail resep untuk informasi lebih lanjut.",
    ];
    const spicyText = `${meal.strMeal} ${ingredients.join(" ")}`;

    return {
      id: `themealdb-${meal.idMeal}`,
      name: meal.strMeal,
      category,
      price: category === "Camilan" ? 15000 : 25000,
      description: descriptionParts.join(" "),
      isSpicy: /chili|chilli|pepper|jalapeno|habanero|sambal|cabai/i.test(spicyText),
      imageUri: meal.strMealThumb,
      rating: 0,
      prepTime: "Lihat resep",
      calories: "Tidak tersedia",
      area: meal.strArea ?? "Tidak diketahui",
      ingredients,
      instructions: meal.strInstructions ?? "Instruksi resep belum tersedia.",
      sourceUrl: meal.strSource ?? "",
    };
  });
}

/** Custom async function: await menunggu custom Promise selesai. */
export async function fetchMenuFromApi(): Promise<MenuItem[]> {
  const meals = await requestMeals();
  return mapMealsToMenu(meals);
}

/** Custom async function untuk pencarian resep langsung ke API. */
export async function searchMenuFromApi(query: string): Promise<MenuItem[]> {
  const meals = await requestMealsByName(query);
  return mapMealsToMenu(meals);
}
