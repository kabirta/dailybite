import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";

type Product = {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  accent: string;
  benefits: string[];
};

const PRODUCTS: Product[] = [
  {
    id: "hb-protein-plus",
    name: "Protein Plus Shake",
    shortDescription: "High-protein recovery blend for lean muscle and steady energy.",
    fullDescription:
      "A smooth daily shake crafted for active routines. It combines whey protein, cocoa, and micronutrients to support recovery, appetite control, and better post-workout nutrition.",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
    accent: "#22C55E",
    benefits: ["24g protein", "Low sugar", "Post-workout recovery"],
  },
  {
    id: "hb-green-detox",
    name: "Green Detox Mix",
    shortDescription: "Daily greens powder with fiber, herbs, and digestive support.",
    fullDescription:
      "A balanced greens formula designed for busy mornings. Each serving includes spinach, moringa, mint, and digestive-friendly fiber to support lighter meals and a cleaner nutrition routine.",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
    accent: "#10B981",
    benefits: ["Digestive support", "Daily greens", "Easy morning mix"],
  },
  {
    id: "hb-omega-heart",
    name: "Omega Heart Capsules",
    shortDescription: "Simple omega support for heart health and everyday wellness.",
    fullDescription:
      "These softgels are built for consistent daily use, giving users a clean source of omega fatty acids that can fit easily into any long-term wellness routine.",
    price: 749,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    accent: "#38BDF8",
    benefits: ["Heart support", "Easy daily dose", "60 capsules"],
  },
];

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-IN")}`;
}

function ProductCard({
  product,
  onBuyNow,
}: {
  product: Product;
  onBuyNow: (product: Product) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: SCREEN_COLORS.card,
        borderRadius: 24,
        marginBottom: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
      }}
    >
      <Image
        source={{ uri: product.image }}
        style={{ width: "100%", height: 190 }}
        resizeMode="cover"
      />

      <View style={{ padding: 18 }}>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "rgba(34,197,94,0.12)",
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: product.accent, fontWeight: "700", fontSize: 12 }}>
            Featured Product
          </Text>
        </View>

        <Text
          style={{
            color: SCREEN_COLORS.text,
            fontSize: 21,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          {product.name}
        </Text>

        <Text
          style={{
            color: "#94A3B8",
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {product.shortDescription}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {product.benefits.map((benefit) => (
            <View
              key={benefit}
              style={{
                backgroundColor: "#111C33",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#CBD5E1", fontSize: 12, fontWeight: "600" }}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <View>
            <Text style={{ color: "#64748B", fontSize: 12, marginBottom: 3 }}>
              Price
            </Text>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 24, fontWeight: "800" }}>
              {formatPrice(product.price)}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onBuyNow(product)}
            style={{
              minWidth: 132,
              height: 48,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: product.accent,
              paddingHorizontal: 18,
            }}
          >
            <Text style={{ color: "#03111F", fontSize: 15, fontWeight: "800" }}>
              Buy Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function StoreScreen() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const totalPrice = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    return selectedProduct.price * quantity;
  }, [quantity, selectedProduct]);

  const openProductSheet = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductSheet = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const changeQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, current + delta));
  };

  const addToCart = () => {
    setCartCount((current) => current + quantity);
    closeProductSheet();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 126, paddingHorizontal: 16 }}
        >
          <View style={{ paddingTop: 20, paddingBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text
                  style={{
                    color: SCREEN_COLORS.primary,
                    fontSize: 12,
                    fontWeight: "700",
                    letterSpacing: 1,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Wellness Store
                </Text>
                <Text
                  style={{
                    color: SCREEN_COLORS.text,
                    fontSize: 28,
                    fontWeight: "800",
                    lineHeight: 34,
                    marginBottom: 10,
                  }}
                >
                  Shop smart nutrition essentials
                </Text>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 20 }}>
                  Browse curated products, open the detail card, adjust quantity,
                  and add items to your cart without leaving the page.
                </Text>
              </View>

              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: SCREEN_COLORS.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: SCREEN_COLORS.border,
                }}
              >
                <Ionicons name="storefront" size={28} color={SCREEN_COLORS.primary} />
              </View>
            </View>

            <View
              style={{
                backgroundColor: SCREEN_COLORS.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, marginBottom: 4 }}>
                  Cart
                </Text>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 20, fontWeight: "800" }}>
                  {cartCount} items
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(56,189,248,0.12)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Ionicons name="cart" size={18} color={SCREEN_COLORS.primary} />
                <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "700" }}>
                  Ready to checkout
                </Text>
              </View>
            </View>
          </View>

          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onBuyNow={openProductSheet} />
          ))}
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>

      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent
        onRequestClose={closeProductSheet}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(7, 45, 102, 0.24)",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeProductSheet} />

          {selectedProduct ? (
            <SafeAreaView
              style={{
                backgroundColor: SCREEN_COLORS.background,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                overflow: "hidden",
              }}
              edges={["bottom"]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={{ width: "100%", height: 220 }}
                  resizeMode="cover"
                />

                <View style={{ padding: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: SCREEN_COLORS.text,
                          fontSize: 24,
                          fontWeight: "800",
                          marginBottom: 6,
                        }}
                      >
                        {selectedProduct.name}
                      </Text>
                      <Text style={{ color: selectedProduct.accent, fontSize: 18, fontWeight: "800" }}>
                        {formatPrice(selectedProduct.price)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={closeProductSheet}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: SCREEN_COLORS.iconBg,
                      }}
                    >
                      <Ionicons name="close" size={20} color={SCREEN_COLORS.primaryDark} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      color: SCREEN_COLORS.textMuted,
                      fontSize: 15,
                      lineHeight: 22,
                      marginBottom: 18,
                    }}
                  >
                    {selectedProduct.fullDescription}
                  </Text>

                  <View style={{ gap: 10, marginBottom: 20 }}>
                    {selectedProduct.benefits.map((benefit) => (
                      <View
                        key={benefit}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          backgroundColor: SCREEN_COLORS.card,
                          borderRadius: 16,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          borderWidth: 1,
                          borderColor: SCREEN_COLORS.border,
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={18} color={selectedProduct.accent} />
                        <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "600" }}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={{
                      backgroundColor: SCREEN_COLORS.card,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: SCREEN_COLORS.border,
                      padding: 18,
                    }}
                  >
                    <Text
                      style={{
                        color: SCREEN_COLORS.textMuted,
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      Choose quantity
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: SCREEN_COLORS.cardSoft,
                          borderRadius: 18,
                          padding: 6,
                          gap: 6,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => changeQuantity(-1)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: SCREEN_COLORS.card,
                          }}
                        >
                          <Ionicons name="remove" size={18} color={SCREEN_COLORS.primaryDark} />
                        </TouchableOpacity>

                        <View style={{ minWidth: 42, alignItems: "center" }}>
                          <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "800" }}>
                            {quantity}
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => changeQuantity(1)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: selectedProduct.accent,
                          }}
                        >
                          <Ionicons name="add" size={18} color="#03111F" />
                        </TouchableOpacity>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 3 }}>
                          Total
                        </Text>
                        <Text style={{ color: SCREEN_COLORS.text, fontSize: 22, fontWeight: "800" }}>
                          {formatPrice(totalPrice)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={addToCart}
                      style={{
                        height: 54,
                        borderRadius: 18,
                        backgroundColor: selectedProduct.accent,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <Ionicons name="cart" size={18} color="#03111F" />
                      <Text style={{ color: "#03111F", fontSize: 16, fontWeight: "800" }}>
                        Add to Cart
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
