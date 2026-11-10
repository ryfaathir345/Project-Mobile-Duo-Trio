export interface MenuItem {
  id: string;
  name: string;
  category: 'Makanan' | 'Minuman' | 'Camilan';
  price: number;
  description: string;
  isSpicy: boolean;
  imageUri: string;
  rating: number;
  prepTime: string;
  calories: string;
}

export const initialMenuData: MenuItem[] = [
  {
    id: "1",
    name: "Nasi Goreng Spesial",
    category: "Makanan",
    price: 25000,
    description: "Nasi goreng racikan khas dengan telur mata sapi, sosis ayam, kerupuk, dan acar segar.",
    isSpicy: true,
    imageUri: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80",
    rating: 4.8,
    prepTime: "15 mnt",
    calories: "450 kkal",
  },
  {
    id: "2",
    name: "Ayam Bakar Madu",
    category: "Makanan",
    price: 30000,
    description: "Ayam bakar bumbu rempah manis gurih madu alami dengan lalapan dan sambal terpisah.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80",
    rating: 4.9,
    prepTime: "20 mnt",
    calories: "520 kkal",
  },
  {
    id: "3",
    name: "Mie Kuah Pedas Mampus",
    category: "Makanan",
    price: 20000,
    description: "Mie kuah pedas gurih kaya rempah dengan cabai rawit merah, sayuran, dan bakso.",
    isSpicy: true,
    imageUri: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80",
    rating: 4.7,
    prepTime: "12 mnt",
    calories: "380 kkal",
  },
  {
    id: "4",
    name: "Kopi Susu Gula Aren",
    category: "Minuman",
    price: 18000,
    description: "Espresso house blend dipadukan dengan susu creamy dan manis legit gula aren murni.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
    rating: 4.9,
    prepTime: "5 mnt",
    calories: "160 kkal",
  },
  {
    id: "5",
    name: "Es Teh Manis Jasmine",
    category: "Minuman",
    price: 6000,
    description: "Teh melati seduh segar dengan es batu melimpah, pelepas dahaga terbaik saat ngoding.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80",
    rating: 4.6,
    prepTime: "3 mnt",
    calories: "70 kkal",
  },
  {
    id: "6",
    name: "Matcha Latte Creamy",
    category: "Minuman",
    price: 22000,
    description: "Bubuk matcha Uji premium dengan susu lembut, seimbang antara pahit manis yang pas.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80",
    rating: 4.8,
    prepTime: "7 mnt",
    calories: "190 kkal",
  },
  {
    id: "7",
    name: "Kentang Goreng Crispy",
    category: "Camilan",
    price: 14000,
    description: "Kentang potong crinkle goreng garing renyah dibumbui garam laut dan saus cocolan mayo.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    rating: 4.7,
    prepTime: "10 mnt",
    calories: "280 kkal",
  },
  {
    id: "8",
    name: "Roti Bakar Keju Cokelat",
    category: "Camilan",
    price: 16000,
    description: "Roti tebal dipanggang renyah dengan isian meses cokelat premium dan taburan keju cheddar.",
    isSpicy: false,
    imageUri: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    rating: 4.8,
    prepTime: "10 mnt",
    calories: "320 kkal",
  },
];

