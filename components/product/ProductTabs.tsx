// components/product/ProductTabs.tsx
import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import RenderHtml from 'react-native-render-html';
import Colors from '@/constants/colors';

// Assume you pass description and reviews as props
interface ProductTabsProps {
  description: string;
  reviews: any[]; // Replace 'any' with your actual review type
}

const DescriptionTab = ({ description }: { description: string }) => {
  const htmlContent = description || '<p>No description available.</p>';

  return (
    <View className="p-4 bg-white rounded-lg mt-4">
      <RenderHtml
        contentWidth={Dimensions.get('window').width - 32}
        source={{ html: htmlContent }}
        tagsStyles={{
          p: { fontSize: 16, color: Colors.text, lineHeight: 24, marginBottom: 8 },
          h1: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
          h2: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
          h3: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
          ul: { marginBottom: 8 },
          ol: { marginBottom: 8 },
          li: { fontSize: 16, color: Colors.text, marginBottom: 4 },
          strong: { fontWeight: 'bold' },
          em: { fontStyle: 'italic' },
        }}
      />
    </View>
  );
};

const ReviewsTab = ({ reviews }: { reviews: any[] }) => (
  <View className="p-4 bg-white rounded-lg mt-4">
    {reviews.length > 0 ? (
      reviews.map(review => (
        <Text key={review.id}>{review.content}</Text> // Build out your review item here
      ))
    ) : (
      <Text className="text-base text-textSecondary text-center">No reviews yet.</Text>
    )}
  </View>
);

const ProductTabs: React.FC<ProductTabsProps> = ({ description, reviews }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'description', title: 'Description' },
    { key: 'reviews', title: `Reviews (${reviews.length})` },
  ]);

  const renderScene = SceneMap({
    description: () => <DescriptionTab description={description} />,
    reviews: () => <ReviewsTab reviews={reviews} />,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: Colors.primary }}
          style={{ backgroundColor: 'transparent', elevation: 0 }}
          activeColor={Colors.text}
          inactiveColor={Colors.textSecondary}
        />
      )}
    />
  );
};

export default ProductTabs;