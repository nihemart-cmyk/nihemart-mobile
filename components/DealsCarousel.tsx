import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ColorValue,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.93;
const ITEM_HEIGHT = 150;

interface Deal {
  id: string;
  title: string;
  subtitle: string;
  merchant: string;
  icon: "bag" | "truck" | "tag";
  gradientColors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  textColor: string;
}

const DEALS_DATA: Deal[] = [
  {
    id: "1",
    title: "Rare Products",
    subtitle: "Products you can't find in Rwanda now delivered to you in 40 mins",
    merchant: "By Kutuku Store",
    icon: "bag",
    gradientColors: ["#A5B4FC", "#E0E7FF"] as const,
    textColor: "#1E293B",
  },
  {
    id: "2",
    title: "Fast Delivery",
    subtitle: "If you are in province don't worry, everyone deserves access to our rare products",
    merchant: "By Kutuku Store",
    icon: "truck",
    gradientColors: ["#A5B4FC", "#E0E7FF"] as const,
    textColor: "#1E293B",
  },
  {
    id: "3",
    title: "Buy Now, Pay Later",
    subtitle: "You like it, we bring it, you pay later",
    merchant: "By Kutuku Store",
    icon: "tag",
    gradientColors: ["#A5B4FC", "#E0E7FF"] as const,
    textColor: "#1E293B",
  },
  {
    id: "3",
    title: "Gifts & More",
    subtitle: "Buy gifts, home appliances, kids products, watchces, necklaces, and more",
    merchant: "By Kutuku Store",
    icon: "tag",
    gradientColors: ["#A5B4FC", "#E0E7FF"] as const,
    textColor: "#1E293B",
  },
  {
    id: "3",
    title: "Low Prices",
    subtitle: "Yes we know, our prices are low",
    merchant: "By Kutuku Store",
    icon: "tag",
    gradientColors: ["#A5B4FC", "#E0E7FF"] as const,
    textColor: "#1E293B",
  },
];

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const IconComponent =
    deal.icon === "bag" ? ShoppingBag : deal.icon === "truck" ? Truck : Tag;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={deal.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: "100%",
          height: "100%",
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Content */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: deal.textColor,
              marginBottom: 4,
              lineHeight: 32,
            }}
          >
            {deal.title}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: deal.textColor,
              marginBottom: 12,
              opacity: 0.9,
            }}
          >
            {deal.subtitle}
          </Text>
          {/* <Text
            style={{
              fontSize: 14,
              color: deal.textColor,
              opacity: 0.7,
            }}
          >
            {deal.merchant}
          </Text> */}
        </View>

        {/* Right Icon/Decoration */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 60,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconComponent size={30} color={deal.textColor} strokeWidth={1.5} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const DealsCarousel: React.FC = () => {
  const carouselRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showControls = DEALS_DATA.length > 1;

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Carousel Container */}
      <View
        style={{
          width: "100%",
          height: ITEM_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Carousel
          ref={carouselRef}
          width={ITEM_WIDTH}
          height={ITEM_HEIGHT}
          data={DEALS_DATA}
          loop={true}
          autoPlay={true}
          autoPlayInterval={4000}
          renderItem={({ item, index }) => (
            <View
              key={`${item.id}-${index}`}
              style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
            >
              <DealCard deal={item} />
            </View>
          )}
          onSnapToItem={(index) => setActiveIndex(index)}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 0,
          }}
        />
      </View>

      {/* Navigation Arrows */}
      {/* {showControls && (
        <>
          <TouchableOpacity
            onPress={() => carouselRef.current?.prev()}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              marginTop: -22,
              padding: 10,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ChevronLeft size={24} color={Colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => carouselRef.current?.next()}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              marginTop: -22,
              padding: 10,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ChevronRight size={24} color={Colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </>
      )} */}

      {/* Pagination Dots */}
      {showControls && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
            gap: 8,
          }}
        >
          {DEALS_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                carouselRef.current?.scrollTo({ index, animated: true })
              }
              style={{
                height: 8,
                borderRadius: 4,
                width: activeIndex === index ? 24 : 8,
                backgroundColor:
                  activeIndex === index
                    ? Colors.primary
                    : Colors.textSecondary + "40",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default DealsCarousel;
