import { Product } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type WishlistState = {
  wishlistItems: Product[];
  loading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  loadWishlist: () => Promise<void>;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],
  loading: true,

  addToWishlist: async (product: Product) => {
    set((state) => {
      // Check if product already exists
      const exists = state.wishlistItems.some((item) => item.id === product.id);
      if (exists) return state;

      const updatedWishlist = [...state.wishlistItems, product];
      AsyncStorage.setItem("wishlist", JSON.stringify(updatedWishlist)).catch(
        console.log
      );
      return { wishlistItems: updatedWishlist };
    });
  },

  removeFromWishlist: async (productId: string) => {
    set((state) => {
      const updatedWishlist = state.wishlistItems.filter(
        (item) => item.id !== productId
      );
      AsyncStorage.setItem("wishlist", JSON.stringify(updatedWishlist)).catch(
        console.log
      );
      return { wishlistItems: updatedWishlist };
    });
  },

  isInWishlist: (productId: string) => {
    return get().wishlistItems.some((item) => item.id === productId);
  },

  clearWishlist: async () => {
    set({ wishlistItems: [] });
    await AsyncStorage.setItem("wishlist", JSON.stringify([]));
  },

  loadWishlist: async () => {
    try {
      const stored = await AsyncStorage.getItem("wishlist");
      if (stored) {
        set({ wishlistItems: JSON.parse(stored), loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.log("Error loading wishlist:", error);
      set({ loading: false });
    }
  },
}));
