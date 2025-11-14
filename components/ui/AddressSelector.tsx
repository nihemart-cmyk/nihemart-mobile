import Colors from "@/constants/colors";
import { AddressSuggestion, useAddresses } from "@/hooks/useAddresses";
import { useAuthStore } from "@/store/auth.store";
import { Address } from "@/types/addresses";
import { useRouter } from "expo-router";
import { Check, MapPin, Plus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Modal,
   Platform,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
// Local administrative data for manual address selection
const provincesRaw: any = require("../../utils/data/provinces.json");
const districtsRaw: any = require("../../utils/data/districts.json");
const sectorsRaw: any = require("../../utils/data/sectors.json");

interface AddressSelectorProps {
   selectedAddress: Address | null;
   onSelectAddress: (address: Address | null) => void;
   showAddButton?: boolean;
}

export function AddressSelector({
   selectedAddress,
   onSelectAddress,
   showAddButton = true,
}: AddressSelectorProps) {
   const { addresses, selected, loading, selectAddress, refresh, saveAddress } =
      useAddresses();
   const [showDialog, setShowDialog] = useState(false);
   const [showAddDialog, setShowAddDialog] = useState(false);
   // Using manual administrative selects only
   const [selectedSuggestion, setSelectedSuggestion] =
      useState<AddressSuggestion | null>(null);
   const [provinces, setProvinces] = useState<any[]>([]);
   const [districtsList, setDistrictsList] = useState<any[]>([]);
   const [sectorsList, setSectorsList] = useState<any[]>([]);

   const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
   const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
   const [selectedSector, setSelectedSector] = useState<any | null>(null);

   const [openProvince, setOpenProvince] = useState(false);
   const [openDistrict, setOpenDistrict] = useState(false);
   const [openSector, setOpenSector] = useState(false);
   const [houseNumber, setHouseNumber] = useState("");
   const [phone, setPhone] = useState("");
   const [isSaving, setIsSaving] = useState(false);
   // search removed — using manual administrative selects only

   // Sync with parent selected address
   useEffect(() => {
      if (selectedAddress) {
         selectAddress(selectedAddress.id);
      }
   }, [selectedAddress?.id]);

   // Load local admin data for manual selects
   useEffect(() => {
      try {
         const provTable = Array.isArray(provincesRaw)
            ? provincesRaw.find((p: any) => p.type === "table" && p.data)
            : null;
         const distTable = Array.isArray(districtsRaw)
            ? districtsRaw.find((p: any) => p.type === "table" && p.data)
            : null;
         const sectTable = Array.isArray(sectorsRaw)
            ? sectorsRaw.find((p: any) => p.type === "table" && p.data)
            : null;

         setProvinces(provTable?.data ?? []);
         setDistrictsList(distTable?.data ?? []);
         setSectorsList(sectTable?.data ?? []);
      } catch (e) {
         console.error("Failed to load admin data for addresses:", e);
      }
   }, []);

   // No search functionality — manual selects only

   const user = useAuthStore((s) => s.user);
   const router = useRouter();

   // Subscribe to auth store changes to ensure user is always fresh
   useEffect(() => {
      console.log("[AddressSelector] user state updated from zustand", {
         user: user?.email ?? "(none)",
         hasUser: !!user,
         userKey: user?.id ?? "(no id)",
      });
   }, [user]);

   const promptSignIn = () => {
      console.log("promptSignIn called, user:", user);
      if (Platform.OS === "web") {
         const ok = window.confirm(
            "You need to sign in to save an address. Go to sign in?"
         );
         if (ok) router.push("/signin");
         return;
      }

      Alert.alert(
         "Sign in required",
         "You need to sign in to save an address.",
         [
            { text: "Cancel", style: "cancel" },
            { text: "Sign in", onPress: () => router.push("/signin") },
         ]
      );
   };

   const handleSaveNewAddress = async () => {
      // Query user directly from store at call-time to avoid stale closure
      const currentUser = useAuthStore.getState().user;
      const storeState = useAuthStore.getState();

      console.log("[AddressSelector.handleSaveNewAddress] Save triggered", {
         currentUser: currentUser?.email ?? "(none)",
         currentUserId: currentUser?.id ?? "(none)",
         hasUser: !!currentUser,
         selectedSuggestion: selectedSuggestion ? "yes" : "no",
         houseNumber,
         phone,
         fullStoreState: {
            user: storeState.user?.email ?? "(none)",
            session: storeState.session ? "exists" : "null",
            roles: Array.from(storeState.roles),
         },
      });

      if (!currentUser) {
         console.warn(
            "[AddressSelector.handleSaveNewAddress] User is null, prompting sign in"
         );
         promptSignIn();
         return;
      }

      if (!selectedSuggestion) {
         Alert.alert("Error", "Please select an address first");
         return;
      }

      setIsSaving(true);
      try {
         const addr = {
            ...selectedSuggestion,
            street:
               selectedSuggestion.address?.road ||
               selectedSuggestion.address?.pedestrian ||
               "",
            house_number: houseNumber || undefined,
            phone: phone || undefined,
            is_default: addresses.length === 0, // Set as default if first address
         };

         console.log("Saving address to supabase", addr);
         const result = await saveAddress(addr);
         console.log("saveAddress result", result);
         if (result) {
            await refresh();
            onSelectAddress(result);
            setShowAddDialog(false);
            setSelectedSuggestion(null);
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedSector(null);
            setHouseNumber("");
            setPhone("");
            Alert.alert("Success", "Address saved successfully");
         } else {
            // Provide clearer feedback when saveAddress returns null
            Alert.alert("Error", "Failed to save address. Please try again.");
         }
      } catch (error: any) {
         console.error("Failed to save address:", error);
         Alert.alert("Error", error?.message || "Failed to save address");
      } finally {
         setIsSaving(false);
      }
   };

   const formatPhoneInput = (input: string) => {
      const cleaned = input.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("+250")) {
         const digits = cleaned.slice(4);
         if (digits.length <= 3) return `+250 ${digits}`;
         if (digits.length <= 6)
            return `+250 ${digits.slice(0, 3)} ${digits.slice(3)}`;
         return `+250 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
      }
      if (cleaned.startsWith("07")) {
         const digits = cleaned;
         if (digits.length <= 3) return digits;
         if (digits.length <= 6)
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
         return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      }
      return cleaned;
   };

   const getAddressDisplayText = (address: Address) => {
      const parts = [
         address.house_number,
         address.street || address.street_address,
         address.city,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : address.display_name || "";
   };

   return (
      <View>
         {/* Address Selection Button */}
         <TouchableOpacity
            onPress={() => setShowDialog(true)}
            className="bg-white rounded-xl p-4 mb-4 border border-gray-200"
         >
            {selectedAddress ? (
               <View>
                  <View className="flex-row items-center mb-2">
                     <MapPin
                        size={18}
                        color={Colors.primary}
                        className="mr-2"
                     />
                     <Text className="text-sm font-medium text-gray-700">
                        Delivery Address
                     </Text>
                  </View>
                  <Text className="text-base text-gray-900">
                     {getAddressDisplayText(selectedAddress)}
                  </Text>
                  {selectedAddress.phone && (
                     <Text className="text-sm text-gray-500 mt-1">
                        {selectedAddress.phone}
                     </Text>
                  )}
               </View>
            ) : (
               <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                     <MapPin
                        size={18}
                        color={Colors.textSecondary}
                        className="mr-2"
                     />
                     <Text className="text-base text-gray-600">
                        Select delivery address
                     </Text>
                  </View>
                  <Plus
                     size={20}
                     color={Colors.textSecondary}
                  />
               </View>
            )}
         </TouchableOpacity>

         {/* Address Selection Modal */}
         <Modal
            visible={showDialog}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setShowDialog(false)}
         >
            <View className="flex-1 bg-gray-50">
               {/* Header */}
               <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">
                     Select Address
                  </Text>
                  <TouchableOpacity onPress={() => setShowDialog(false)}>
                     <X
                        size={24}
                        color={Colors.text}
                     />
                  </TouchableOpacity>
               </View>

               <ScrollView className="flex-1 px-4 py-4">
                  {loading ? (
                     <View className="items-center justify-center py-8">
                        <ActivityIndicator
                           size="large"
                           color={Colors.primary}
                        />
                     </View>
                  ) : addresses.length > 0 ? (
                     <View className="space-y-3">
                        {addresses.map((address) => (
                           <TouchableOpacity
                              key={address.id}
                              onPress={() => {
                                 selectAddress(address.id);
                                 onSelectAddress(address);
                                 setShowDialog(false);
                              }}
                              className={`bg-white rounded-xl p-4 border ${
                                 selectedAddress?.id === address.id
                                    ? "border-primary bg-orange-50"
                                    : "border-gray-200"
                              }`}
                           >
                              <View className="flex-row items-start justify-between">
                                 <View className="flex-1">
                                    {address.is_default && (
                                       <View className="flex-row items-center mb-1">
                                          <View className="bg-primary px-2 py-1 rounded">
                                             <Text className="text-xs text-white font-medium">
                                                Default
                                             </Text>
                                          </View>
                                       </View>
                                    )}
                                    <Text className="text-base font-medium text-gray-900">
                                       {getAddressDisplayText(address)}
                                    </Text>
                                    {address.phone && (
                                       <Text className="text-sm text-gray-500 mt-1">
                                          {address.phone}
                                       </Text>
                                    )}
                                 </View>
                                 {selectedAddress?.id === address.id && (
                                    <Check
                                       size={20}
                                       color={Colors.primary}
                                    />
                                 )}
                              </View>
                           </TouchableOpacity>
                        ))}
                     </View>
                  ) : (
                     <View className="items-center justify-center py-8">
                        <MapPin
                           size={48}
                           color={Colors.textSecondary}
                        />
                        <Text className="text-lg font-medium text-gray-700 mt-4">
                           No saved addresses
                        </Text>
                        <Text className="text-sm text-gray-500 mt-2 text-center">
                           Add your first delivery address to continue
                        </Text>
                     </View>
                  )}

                  {showAddButton && (
                     <TouchableOpacity
                        onPress={() => {
                           setShowDialog(false);
                           setShowAddDialog(true);
                        }}
                        className="bg-primary rounded-xl p-4 mt-4 flex-row items-center justify-center"
                     >
                        <Plus
                           size={20}
                           color="white"
                           className="mr-2"
                        />
                        <Text className="text-white font-semibold text-base">
                           Add New Address
                        </Text>
                     </TouchableOpacity>
                  )}
               </ScrollView>
            </View>
         </Modal>

         {/* Add Address Modal */}
         <Modal
            visible={showAddDialog}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setShowAddDialog(false)}
         >
            <View className="flex-1 bg-gray-50">
               {/* Header */}
               <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">
                     Add Address
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddDialog(false)}>
                     <X
                        size={24}
                        color={Colors.text}
                     />
                  </TouchableOpacity>
               </View>

               <ScrollView className="flex-1 px-4 py-4">
                  {/* (Search UI removed) Use manual selects below */}

                  {/* Manual administrative selects: Province -> District -> Sector */}
                  <View className="mt-4">
                     <Text className="text-sm font-medium text-gray-700 mb-2">
                        Select by administrative area
                     </Text>

                     {/* Province selector */}
                     <View className="mb-3">
                        <TouchableOpacity
                           onPress={() => setOpenProvince(!openProvince)}
                           className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                        >
                           <Text className="text-base">
                              {selectedProvince?.prv_name?.trim() ||
                                 "Select province"}
                           </Text>
                        </TouchableOpacity>
                        {openProvince && (
                           <View className="bg-white border border-gray-200 rounded-xl mt-2 max-h-40">
                              <ScrollView>
                                 {provinces.map((p: any) => (
                                    <TouchableOpacity
                                       key={p.prv_id}
                                       onPress={() => {
                                          setSelectedProvince(p);
                                          setSelectedDistrict(null);
                                          setSelectedSector(null);
                                          setOpenProvince(false);
                                          setOpenDistrict(false);
                                          setOpenSector(false);
                                       }}
                                       className="px-4 py-3 border-b border-gray-100"
                                    >
                                       <Text>{p.prv_name?.trim()}</Text>
                                    </TouchableOpacity>
                                 ))}
                              </ScrollView>
                           </View>
                        )}
                     </View>

                     {/* District selector (shows after province) */}
                     {selectedProvince && (
                        <View className="mb-3">
                           <TouchableOpacity
                              onPress={() => setOpenDistrict(!openDistrict)}
                              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                           >
                              <Text className="text-base">
                                 {selectedDistrict?.dst_name?.trim() ||
                                    "Select district"}
                              </Text>
                           </TouchableOpacity>
                           {openDistrict && (
                              <View className="bg-white border border-gray-200 rounded-xl mt-2 max-h-40">
                                 <ScrollView>
                                    {districtsList
                                       .filter(
                                          (d: any) =>
                                             String(d.dst_province) ===
                                             String(selectedProvince.prv_id)
                                       )
                                       .map((d: any) => (
                                          <TouchableOpacity
                                             key={d.dst_id}
                                             onPress={() => {
                                                setSelectedDistrict(d);
                                                setSelectedSector(null);
                                                setOpenDistrict(false);
                                                setOpenSector(false);
                                             }}
                                             className="px-4 py-3 border-b border-gray-100"
                                          >
                                             <Text>{d.dst_name?.trim()}</Text>
                                          </TouchableOpacity>
                                       ))}
                                 </ScrollView>
                              </View>
                           )}
                        </View>
                     )}

                     {/* Sector selector (shows after district) */}
                     {selectedDistrict && (
                        <View className="mb-3">
                           <TouchableOpacity
                              onPress={() => setOpenSector(!openSector)}
                              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                           >
                              <Text className="text-base">
                                 {selectedSector?.sct_name?.trim() ||
                                    "Select sector"}
                              </Text>
                           </TouchableOpacity>
                           {openSector && (
                              <View className="bg-white border border-gray-200 rounded-xl mt-2 max-h-40">
                                 <ScrollView>
                                    {sectorsList
                                       .filter(
                                          (s: any) =>
                                             String(s.sct_district) ===
                                             String(selectedDistrict.dst_id)
                                       )
                                       .map((s: any) => (
                                          <TouchableOpacity
                                             key={s.sct_id}
                                             onPress={() => {
                                                setSelectedSector(s);
                                                setOpenSector(false);

                                                // Build a simple selectedSuggestion object
                                                const manual: AddressSuggestion =
                                                   {
                                                      display_name: `${selectedProvince.prv_name?.trim() || ""}, ${selectedDistrict.dst_name?.trim() || ""}, ${s.sct_name?.trim() || ""}`,
                                                      lat: "",
                                                      lon: "",
                                                      address: {
                                                         province:
                                                            selectedProvince.prv_name,
                                                         district:
                                                            selectedDistrict.dst_name,
                                                         sector: s.sct_name,
                                                         city: selectedDistrict.dst_name,
                                                      },
                                                   };
                                                setSelectedSuggestion(manual);
                                             }}
                                             className="px-4 py-3 border-b border-gray-100"
                                          >
                                             <Text>{s.sct_name?.trim()}</Text>
                                          </TouchableOpacity>
                                       ))}
                                 </ScrollView>
                              </View>
                           )}
                        </View>
                     )}
                  </View>

                  {/* Address Details Form */}
                  {selectedSuggestion && (
                     <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-4">
                           Address Details
                        </Text>

                        {/* House Number */}
                        <View className="mb-4">
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              House number (optional)
                           </Text>
                           <TextInput
                              value={houseNumber}
                              onChangeText={setHouseNumber}
                              placeholder="House / apartment number"
                              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                              placeholderTextColor={Colors.textSecondary}
                           />
                        </View>

                        {/* Phone */}
                        <View className="mb-4">
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              Contact phone
                           </Text>
                           <TextInput
                              value={phone}
                              onChangeText={(text) =>
                                 setPhone(formatPhoneInput(text))
                              }
                              placeholder="+250... or 07..."
                              keyboardType="phone-pad"
                              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                              placeholderTextColor={Colors.textSecondary}
                           />
                           <Text className="text-xs text-gray-500 mt-1">
                              Accepts +250XXXXXXXXX or 07XXXXXXXX
                           </Text>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                           onPress={handleSaveNewAddress}
                           disabled={isSaving}
                           className={`bg-primary rounded-xl p-4 flex-row items-center justify-center ${
                              isSaving ? "opacity-50" : ""
                           }`}
                        >
                           {isSaving ? (
                              <ActivityIndicator
                                 color="white"
                                 className="mr-2"
                              />
                           ) : null}
                           <Text className="text-white font-semibold text-base">
                              {isSaving ? "Saving..." : "Save Address"}
                           </Text>
                        </TouchableOpacity>
                     </View>
                  )}
               </ScrollView>
            </View>
         </Modal>
      </View>
   );
}

export default AddressSelector;
