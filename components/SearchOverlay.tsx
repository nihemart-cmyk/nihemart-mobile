import React, { useState, useMemo } from "react";
import {
   View,
   Text,
   Modal,
   SafeAreaView,
   TextInput,
   TouchableOpacity,
   FlatList,
   ActivityIndicator,
} from "react-native";
import { X, Search } from "lucide-react-native";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/useProducts";
import Colors from "@/constants/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

// Define the component's props
interface SearchOverlayProps {
   visible: boolean;
   onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose }) => {
   const router = useRouter();
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay is good for search

   const productOptions = useMemo(
      () => ({
         search: debouncedSearchQuery.trim(),
         limit: 20, // Fetch more results for search
      }),
      [debouncedSearchQuery]
   );

   const {
      data: productsData,
      isLoading,
      isFetching,
   } = useProducts(
      productOptions,
      // Important: Only enable the query when the user has typed something
      { enabled: debouncedSearchQuery.trim().length > 1 }
   );

   const products =
      (productsData as any)?.pages.flatMap((page: any) => page.products) || [];

   const handleProductPress = (productId: string) => {
      // Navigate to the product page
      router.push(`/product/${productId}` as any);
      // Close the modal after navigation
      onClose();
   };

   return (
      <Modal
         visible={visible}
         animationType="slide"
         transparent={false}
         onRequestClose={onClose} // For Android back button
      >
         <SafeAreaView className="flex-1 bg-background">
            {/* Header with Search Input and Close Button */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
               <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
                  <Search
                     size={20}
                     color={Colors.textSecondary}
                  />
                  <TextInput
                     className="flex-1 text-base text-text"
                     placeholder="Search for products..."
                     placeholderTextColor={Colors.textSecondary}
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                     autoFocus={true} // Automatically focus the input when modal opens
                  />
               </View>
               <TouchableOpacity
                  onPress={onClose}
                  className="pl-4"
               >
                  <X
                     size={28}
                     color={Colors.text}
                  />
               </TouchableOpacity>
            </View>

            {/* Search Results */}
            <View className="flex-1 px-4">
               {isLoading || isFetching ? (
                  <View className="flex-1 justify-center items-center">
                     <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                     />
                  </View>
               ) : debouncedSearchQuery.trim().length <= 1 ? (
                  <View className="flex-1 justify-center items-center">
                     <Text className="text-textSecondary text-lg">
                        Start typing to find products
                     </Text>
                  </View>
               ) : products.length === 0 ? (
                  <View className="flex-1 justify-center items-center">
                     <Text className="text-textSecondary text-lg">
                        No results found for "{debouncedSearchQuery}"
                     </Text>
                  </View>
               ) : (
                  <FlatList
                     data={products}
                     keyExtractor={(item) => item.id}
                     showsVerticalScrollIndicator={false}
                     renderItem={({ item }) => (
                        <TouchableOpacity
                           className="flex-row items-center py-3 border-b border-gray-100"
                           onPress={() => handleProductPress(item.id)}
                        >
                           {/* Left Side: Image */}
                           <Image
                              source={{
                                 uri:
                                    item.main_image_url ||
                                    "https://via.placeholder.com/150",
                              }}
                              className="w-16 h-16 rounded-lg bg-gray-200"
                              contentFit="cover"
                           />
                           {/* Right Side: Details */}
                           <View className="flex-1 pl-4">
                              <Text
                                 className="text-text text-base font-semibold"
                                 numberOfLines={2}
                              >
                                 {item.name}
                              </Text>
                              <Text className="text-primary text-base font-bold mt-1">
                                 RWF {item.price}
                              </Text>
                           </View>
                        </TouchableOpacity>
                     )}
                  />
               )}
            </View>
         </SafeAreaView>
      </Modal>
   );
};

export default SearchOverlay;
