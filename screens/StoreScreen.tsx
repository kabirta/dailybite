import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { createStoreOrder, listStoreProducts, verifyStorePayment } from "../src/services/backendApi";

declare const require: any;

type Product = {
  _id: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  price: number;
  currency?: string;
  image?: string;
  accent?: string;
  benefits?: string[];
  stock?: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80";

const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
};

function formatPrice(price: number) {
  return `Rs ${Number(price || 0).toLocaleString("en-IN")}`;
}

function getSafeAccent(accent?: string) {
  const value = String(accent || "").trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
    ? value
    : SCREEN_COLORS.primary;
}

function getRazorpayCheckout() {
  try {
    return require("react-native-razorpay");
  } catch {
    return null;
  }
}

function ProductCard({
  product,
  onBuyNow,
}: {
  product: Product;
  onBuyNow: (product: Product) => void;
}) {
  const accent = getSafeAccent(product.accent);

  return (
    <View
      style={{
        backgroundColor: SCREEN_COLORS.card,
        borderRadius: 18,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
      }}
    >
      <Image
        source={{ uri: product.image || FALLBACK_IMAGE }}
        style={{ width: "100%", height: 178 }}
        resizeMode="cover"
      />

      <View style={{ padding: 16 }}>
        <Text style={{ color: accent, fontWeight: "800", fontSize: 12, marginBottom: 8 }}>
          {product.stock === 0 ? "Out of stock" : "DailyBite Store"}
        </Text>
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
          {product.name}
        </Text>
        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 14 }}>
          {product.shortDescription}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {(product.benefits || []).slice(0, 3).map((benefit) => (
            <View
              key={benefit}
              style={{
                backgroundColor: SCREEN_COLORS.cardSoft,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, fontWeight: "600" }}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ color: SCREEN_COLORS.text, fontSize: 22, fontWeight: "800" }}>
            {formatPrice(product.price)}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={product.stock === 0}
            onPress={() => onBuyNow(product)}
            style={{
              minWidth: 120,
              height: 46,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: product.stock === 0 ? "#94A3B8" : accent,
              paddingHorizontal: 16,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [message, setMessage] = useState("");

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * quantity;
  }, [quantity, selectedProduct]);

  const loadProducts = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listStoreProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setMessage(error?.message || "Could not load store products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const openProductSheet = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductSheet = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setAddress(EMPTY_ADDRESS);
    setIsCheckingOut(false);
  };

  const changeQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(selectedProduct?.stock || 99, current + delta)));
  };

  const updateAddress = (key: keyof ShippingAddress, value: string) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const checkout = async () => {
    if (!selectedProduct || isCheckingOut) return;

    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim()) {
      Alert.alert("Delivery details needed", "Please enter your name, phone, and address.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const data = await createStoreOrder({
        items: [{ productId: selectedProduct._id, quantity }],
        shippingAddress: address,
      });
      const { order, payment } = data;
      const RazorpayCheckout = getRazorpayCheckout();

      if (!payment?.enabled) {
        Alert.alert(
          "Order created",
          "Razorpay keys are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env to enable live checkout."
        );
        closeProductSheet();
        await loadProducts();
        return;
      }

      if (!RazorpayCheckout) {
        Alert.alert(
          "Razorpay order ready",
          `Order ${order.orderNumber} was created. Install react-native-razorpay in the app to open the native payment sheet.`
        );
        closeProductSheet();
        return;
      }

      const result = await RazorpayCheckout.open({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: payment.name,
        description: payment.description,
        order_id: payment.orderId,
        prefill: payment.prefill,
        theme: { color: getSafeAccent(selectedProduct.accent) },
      });

      await verifyStorePayment({
        orderId: order._id,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      Alert.alert("Payment successful", "Your DailyBite order is confirmed.");
      closeProductSheet();
      await loadProducts();
    } catch (error: any) {
      Alert.alert("Checkout failed", error?.message || "Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                  Wellness Store
                </Text>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "800", lineHeight: 34 }}>
                  Shop nutrition essentials
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => loadProducts()}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: SCREEN_COLORS.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: SCREEN_COLORS.border,
                }}
              >
                <Ionicons name="refresh" size={24} color={SCREEN_COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: SCREEN_COLORS.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Ionicons name="shield-checkmark" size={22} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.textMuted, flex: 1, lineHeight: 20 }}>
                Secure checkout, live inventory, and tracked delivery for every order.
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 12 }}>Loading products</Text>
            </View>
          ) : message ? (
            <View style={{ padding: 18, backgroundColor: SCREEN_COLORS.card, borderRadius: 16 }}>
              <Text style={{ color: SCREEN_COLORS.text }}>{message}</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={{ padding: 18, backgroundColor: SCREEN_COLORS.card, borderRadius: 16 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800", marginBottom: 6 }}>
                No products yet
              </Text>
              <Text style={{ color: SCREEN_COLORS.textMuted }}>
                Add products from the admin panel and they will appear here.
              </Text>
            </View>
          ) : (
            products.map((product) => (
              <ProductCard key={product._id} product={product} onBuyNow={openProductSheet} />
            ))
          )}
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>

      <Modal visible={!!selectedProduct} animationType="slide" transparent onRequestClose={closeProductSheet}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(7, 45, 102, 0.24)" }}>
          <Pressable style={{ flex: 1 }} onPress={closeProductSheet} />

          {selectedProduct ? (
            <SafeAreaView
              style={{
                backgroundColor: SCREEN_COLORS.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
              }}
              edges={["bottom"]}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <Image
                  source={{ uri: selectedProduct.image || FALLBACK_IMAGE }}
                  style={{ width: "100%", height: 190 }}
                  resizeMode="cover"
                />

                <View style={{ padding: 18 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 23, fontWeight: "800", marginBottom: 6 }}>
                        {selectedProduct.name}
                      </Text>
                      <Text style={{ color: getSafeAccent(selectedProduct.accent), fontSize: 18, fontWeight: "800" }}>
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

                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 16 }}>
                    {selectedProduct.fullDescription || selectedProduct.shortDescription}
                  </Text>

                  <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 16 }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800", marginBottom: 12 }}>
                      Quantity
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <TouchableOpacity onPress={() => changeQuantity(-1)} style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: SCREEN_COLORS.cardSoft }}>
                          <Ionicons name="remove" size={18} color={SCREEN_COLORS.primaryDark} />
                        </TouchableOpacity>
                        <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "800", minWidth: 34, textAlign: "center" }}>
                          {quantity}
                        </Text>
                        <TouchableOpacity onPress={() => changeQuantity(1)} style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: getSafeAccent(selectedProduct.accent) }}>
                          <Ionicons name="add" size={18} color="#03111F" />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 22, fontWeight: "800" }}>
                        {formatPrice(totalPrice)}
                      </Text>
                    </View>

                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
                      Delivery
                    </Text>
                    {[
                      ["name", "Full name"],
                      ["phone", "Phone"],
                      ["line1", "Address"],
                      ["city", "City"],
                      ["state", "State"],
                      ["postalCode", "PIN code"],
                    ].map(([key, placeholder]) => (
                      <TextInput
                        key={key}
                        value={address[key as keyof ShippingAddress]}
                        onChangeText={(value) => updateAddress(key as keyof ShippingAddress, value)}
                        placeholder={placeholder}
                        placeholderTextColor="#94A3B8"
                        style={{
                          minHeight: 44,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: SCREEN_COLORS.border,
                          color: SCREEN_COLORS.text,
                          paddingHorizontal: 12,
                          marginBottom: 10,
                          backgroundColor: SCREEN_COLORS.background,
                        }}
                      />
                    ))}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={isCheckingOut}
                      onPress={checkout}
                      style={{
                        height: 54,
                        borderRadius: 16,
                        backgroundColor: getSafeAccent(selectedProduct.accent),
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 8,
                        opacity: isCheckingOut ? 0.7 : 1,
                      }}
                    >
                      {isCheckingOut ? <ActivityIndicator color="#03111F" /> : <Ionicons name="card" size={18} color="#03111F" />}
                      <Text style={{ color: "#03111F", fontSize: 16, fontWeight: "800" }}>
                        Pay with Razorpay
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
