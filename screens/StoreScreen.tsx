import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
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
import { useLanguage } from "../src/i18n/LanguageContext";
import {
  createStoreOrder,
  listStoreProducts,
  verifyStorePayment,
} from "../src/services/backendApi";

declare const require: any;

type Product = {
  _id: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  image?: string;
  accent?: string;
  benefits?: string[];
  category?: string;
  stock?: number;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
};

type PaymentMethod = "razorpay" | "cod";

const CART_STORAGE_KEY = "nutrimed.store.cart";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80";

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

function getExpoLocation() {
  try {
    return require("expo-location");
  } catch {
    return null;
  }
}

function normalizeCategory(category?: string) {
  const value = String(category || "wellness").trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Wellness";
}

function ProductCard({
  product,
  quantity,
  onAdd,
  onChangeQuantity,
  onOpenDetails,
}: {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onChangeQuantity: (product: Product, delta: number) => void;
  onOpenDetails: (product: Product) => void;
}) {
  const { t } = useLanguage();
  const accent = getSafeAccent(product.accent);
  const inStock = Number(product.stock ?? 0) > 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={() => onOpenDetails(product)}
      style={{
        width: "48%",
        backgroundColor: SCREEN_COLORS.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <View style={{ backgroundColor: SCREEN_COLORS.cardSoft, padding: 8 }}>
        <Image
          source={{ uri: product.image || FALLBACK_IMAGE }}
          style={{ width: "100%", aspectRatio: 1.15, borderRadius: 8 }}
          resizeMode="cover"
        />
        {discount ? (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "#16A34A",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>{discount}% {t("off")}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>
          {normalizeCategory(product.category)}
        </Text>
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "900", minHeight: 38 }} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, lineHeight: 16, marginTop: 5, minHeight: 32 }} numberOfLines={2}>
          {product.shortDescription}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 8 }}>
          <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900" }}>
            {formatPrice(product.price)}
          </Text>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, textDecorationLine: "line-through" }}>
              {formatPrice(product.compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {!inStock ? (
          <View style={{ height: 38, borderRadius: 8, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
            <Text style={{ color: "#64748B", fontWeight: "900" }}>{t("Out of stock")}</Text>
          </View>
        ) : quantity > 0 ? (
          <View style={{ height: 38, borderRadius: 8, borderWidth: 1, borderColor: accent, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <TouchableOpacity onPress={() => onChangeQuantity(product, -1)} style={{ width: 38, alignItems: "center" }}>
              <Ionicons name="remove" size={18} color={accent} />
            </TouchableOpacity>
            <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900" }}>{quantity}</Text>
            <TouchableOpacity onPress={() => onChangeQuantity(product, 1)} style={{ width: 38, alignItems: "center" }}>
              <Ionicons name="add" size={18} color={accent} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onAdd(product)}
            style={{ height: 38, borderRadius: 8, borderWidth: 1, borderColor: accent, alignItems: "center", justifyContent: "center", marginTop: 10 }}
          >
            <Text style={{ color: accent, fontSize: 14, fontWeight: "900" }}>{t("Add")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function StoreScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [message, setMessage] = useState("");

  const productMap = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);

  const categories = useMemo(() => {
    const values = products.map((product) => normalizeCategory(product.category));
    return ["All", ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || normalizeCategory(product.category) === selectedCategory;
      const matchesQuery =
        !search ||
        [product.name, product.shortDescription, product.category, ...(product.benefits || [])]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, selectedCategory]);

  const cartLines = useMemo(
    () =>
      cart
        .map((item) => ({ item, product: productMap.get(item.productId) }))
        .filter((line): line is { item: CartItem; product: Product } => Boolean(line.product)),
    [cart, productMap]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const payableTotal = subtotal + shippingFee;

  const getCartQuantity = useCallback(
    (productId: string) => cart.find((item) => item.productId === productId)?.quantity ?? 0,
    [cart]
  );

  const loadProducts = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setMessage("");

    try {
      const productData = await listStoreProducts();
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error: any) {
      setMessage(error?.message || "Could not load pharmacy products.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setCart(
            parsed
              .filter((item) => item?.productId && Number(item.quantity) > 0)
              .map((item) => ({ productId: String(item.productId), quantity: Number(item.quantity) }))
          );
        }
      })
      .catch(() => undefined);
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(() => undefined);
  }, [cart]);

  const changeCartQuantity = (product: Product, delta: number) => {
    if (Number(product.stock ?? 0) <= 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.productId === product._id);
      const maxStock = Math.max(1, Number(product.stock ?? 99));
      const nextQuantity = Math.max(0, Math.min(maxStock, (existing?.quantity ?? 0) + delta));

      if (nextQuantity === 0) {
        return current.filter((item) => item.productId !== product._id);
      }

      if (existing) {
        return current.map((item) =>
          item.productId === product._id ? { ...item, quantity: nextQuantity } : item
        );
      }

      return [...current, { productId: product._id, quantity: nextQuantity }];
    });
  };

  const addToCart = (product: Product) => {
    changeCartQuantity(product, 1);
    setCartVisible(true);
  };

  const updateAddress = (key: keyof ShippingAddress, value: string) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const useCurrentLocation = async () => {
    if (isLocating) return;

    setIsLocating(true);
    try {
      const Location = getExpoLocation();
      if (!Location) {
        Alert.alert(
          t("Location update needed"),
          t("Please install the latest app build to use automatic address detection.")
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(t("Location permission needed"), t("Allow location access to auto-fill your delivery address."));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (!place) {
        Alert.alert(t("Address not found"), t("We found your location, but could not convert it into an address."));
        return;
      }

      const lineParts = [
        place.name,
        place.streetNumber,
        place.street,
        place.district,
        place.subregion,
      ]
        .map((part) => String(part || "").trim())
        .filter(Boolean);

      setAddress((current) => ({
        ...current,
        line1: lineParts.length ? Array.from(new Set(lineParts)).join(", ") : current.line1,
        city: place.city || current.city,
        state: place.region || current.state,
        postalCode: place.postalCode || current.postalCode,
      }));
    } catch (error) {
      console.warn("[Store] Location fetch failed", error);
      Alert.alert(t("Could not fetch location"), error instanceof Error ? error.message : t("Please enter address manually."));
    } finally {
      setIsLocating(false);
    }
  };

  const checkout = async () => {
    if (!cartLines.length || isCheckingOut) return;

    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim()) {
      Alert.alert(t("Delivery details needed"), t("Please enter your name, phone, and address."));
      return;
    }

    setIsCheckingOut(true);
    try {
      const data = await createStoreOrder({
        items: cartLines.map((line) => ({ productId: line.product._id, quantity: line.item.quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      const { order, payment } = data;

      if (payment?.provider === "cod") {
        Alert.alert(t("Order placed"), `${t("Order")} ${order.orderNumber} ${t("is confirmed for Cash on Delivery.")}`);
        setCart([]);
        setCartVisible(false);
        setAddress(EMPTY_ADDRESS);
        await loadProducts();
        return;
      }

      const RazorpayCheckout = getRazorpayCheckout();

      if (!payment?.enabled) {
        Alert.alert(
          t("Order created"),
          t("Razorpay keys are not configured yet. The order was saved in backend as pending payment.")
        );
        setCart([]);
        setCartVisible(false);
        setAddress(EMPTY_ADDRESS);
        await loadProducts();
        return;
      }

      if (!RazorpayCheckout) {
        Alert.alert(t("Order ready"), `${t("Order")} ${order.orderNumber} ${t("was created. Razorpay native checkout is unavailable in this build.")}`);
        setCart([]);
        setCartVisible(false);
        setAddress(EMPTY_ADDRESS);
        await loadProducts();
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
        theme: { color: SCREEN_COLORS.primary },
      });

      await verifyStorePayment({
        orderId: order._id,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      Alert.alert(t("Payment successful"), t("Your order is confirmed."));
      setCart([]);
      setCartVisible(false);
      setAddress(EMPTY_ADDRESS);
      await loadProducts();
    } catch (error: any) {
      Alert.alert(t("Checkout failed"), error?.message || t("Please try again."));
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
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadProducts({ refreshing: true })} />}
          contentContainerStyle={{ paddingBottom: 142, paddingHorizontal: 16 }}
        >
          <View style={{ paddingTop: 6, flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => router.push("/store-orders")}
              style={{
                height: 42,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                backgroundColor: SCREEN_COLORS.card,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="receipt-outline" size={20} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "900" }}>{t("My Orders")}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 18, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "900", marginBottom: 8 }}>
                  {t("NUTRIMED PHARMACY")}
                </Text>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "900", lineHeight: 34 }}>
                  {t("Medicines & wellness")}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => setCartVisible(true)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 8,
                  backgroundColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="cart" size={24} color="#fff" />
                {cartCount ? (
                  <View style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#EF4444", borderRadius: 999, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>{cartCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 18, backgroundColor: "#EAF7F1", borderRadius: 8, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Ionicons name="shield-checkmark" size={22} color="#047857" />
              <Text style={{ color: "#065F46", flex: 1, lineHeight: 20, fontWeight: "700" }}>
                {t("Genuine products, secure payment, backend order tracking.")}
              </Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <View style={{ height: 48, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, backgroundColor: SCREEN_COLORS.card, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
                <Ionicons name="search" size={18} color={SCREEN_COLORS.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t("Search medicines, vitamins...")}
                  placeholderTextColor={SCREEN_COLORS.textMuted}
                  style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 14 }}
                />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 14 }}>
              {categories.map((category) => {
                const isActive = category === selectedCategory;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                      borderWidth: 1,
                      borderColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                    }}
                  >
                    <Text style={{ color: isActive ? "#fff" : SCREEN_COLORS.text, fontSize: 13, fontWeight: "800" }}>
                      {t(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 70, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 12 }}>{t("Loading pharmacy")}</Text>
            </View>
          ) : message ? (
            <View style={{ padding: 18, backgroundColor: SCREEN_COLORS.card, borderRadius: 8 }}>
              <Text style={{ color: SCREEN_COLORS.text }}>{message}</Text>
            </View>
          ) : visibleProducts.length === 0 ? (
            <View style={{ padding: 18, backgroundColor: SCREEN_COLORS.card, borderRadius: 8 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900", marginBottom: 6 }}>{t("No products found")}</Text>
              <Text style={{ color: SCREEN_COLORS.textMuted }}>{t("Add matching products from the admin panel.")}</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  quantity={getCartQuantity(product._id)}
                  onAdd={addToCart}
                  onChangeQuantity={changeCartQuantity}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {cartCount ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setCartVisible(true)}
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 86,
              height: 54,
              borderRadius: 8,
              backgroundColor: SCREEN_COLORS.primary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>{cartCount} {cartCount > 1 ? t("items") : t("item")}</Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>{t("View cart")} - {formatPrice(payableTotal)}</Text>
          </TouchableOpacity>
        ) : null}

        <AppBottomNav />
      </ScreenBackground>

      <Modal visible={!!selectedProduct} animationType="fade" transparent onRequestClose={() => setSelectedProduct(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(3,17,31,0.45)", justifyContent: "flex-end" }}>
          <Pressable style={{ flex: 1 }} onPress={() => setSelectedProduct(null)} />
          {selectedProduct ? (
            <View style={{ backgroundColor: SCREEN_COLORS.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "84%" }}>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
                <Image source={{ uri: selectedProduct.image || FALLBACK_IMAGE }} style={{ width: "100%", height: 210, borderRadius: 8 }} resizeMode="cover" />
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 23, fontWeight: "900", marginTop: 16 }}>{selectedProduct.name}</Text>
                <Text style={{ color: SCREEN_COLORS.primary, fontSize: 20, fontWeight: "900", marginTop: 6 }}>{formatPrice(selectedProduct.price)}</Text>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 15, lineHeight: 22, marginTop: 12 }}>
                  {selectedProduct.fullDescription || selectedProduct.shortDescription}
                </Text>
                {(selectedProduct.benefits || []).length ? (
                  <View style={{ gap: 8, marginTop: 14 }}>
                    {selectedProduct.benefits?.map((benefit) => (
                      <View key={benefit} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Ionicons name="checkmark-circle" size={17} color="#16A34A" />
                        <Text style={{ color: SCREEN_COLORS.text, flex: 1 }}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <TouchableOpacity
                  disabled={Number(selectedProduct.stock ?? 0) <= 0}
                  onPress={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{
                    height: 52,
                    borderRadius: 8,
                    backgroundColor: Number(selectedProduct.stock ?? 0) <= 0 ? "#94A3B8" : SCREEN_COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 18,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
                    {Number(selectedProduct.stock ?? 0) <= 0 ? t("Out of stock") : t("Add to cart")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal visible={cartVisible} animationType="slide" transparent onRequestClose={() => setCartVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(3,17,31,0.42)", justifyContent: "flex-end" }}>
          <Pressable style={{ flex: 1 }} onPress={() => setCartVisible(false)} />
          <SafeAreaView style={{ backgroundColor: SCREEN_COLORS.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "90%" }} edges={["bottom"]}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 22, fontWeight: "900" }}>{t("Cart")}</Text>
                <TouchableOpacity onPress={() => setCartVisible(false)}>
                  <Ionicons name="close" size={24} color={SCREEN_COLORS.primaryDark} />
                </TouchableOpacity>
              </View>

              {!cartLines.length ? (
                <View style={{ alignItems: "center", paddingVertical: 34 }}>
                  <Ionicons name="cart-outline" size={34} color={SCREEN_COLORS.primary} />
                  <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900", marginTop: 10 }}>{t("Your cart is empty")}</Text>
                </View>
              ) : (
                <>
                  <View style={{ gap: 10 }}>
                    {cartLines.map(({ item, product }) => (
                      <View key={product._id} style={{ flexDirection: "row", gap: 12, backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 10 }}>
                        <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={{ width: 64, height: 64, borderRadius: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900" }} numberOfLines={2}>{product.name}</Text>
                          <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "900", marginTop: 4 }}>{formatPrice(product.price * item.quantity)}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                            <TouchableOpacity onPress={() => changeCartQuantity(product, -1)}><Ionicons name="remove-circle-outline" size={24} color={SCREEN_COLORS.primary} /></TouchableOpacity>
                            <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900" }}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => changeCartQuantity(product, 1)}><Ionicons name="add-circle-outline" size={24} color={SCREEN_COLORS.primary} /></TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 14, marginTop: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900", flex: 1 }}>{t("Delivery address")}</Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={isLocating}
                        onPress={() => void useCurrentLocation()}
                        style={{
                          minHeight: 36,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: SCREEN_COLORS.primary,
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          opacity: isLocating ? 0.65 : 1,
                        }}
                      >
                        {isLocating ? (
                          <ActivityIndicator size="small" color={SCREEN_COLORS.primary} />
                        ) : (
                          <Ionicons name="locate" size={16} color={SCREEN_COLORS.primary} />
                        )}
                        <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "900" }}>
                          {isLocating ? t("Fetching") : t("Use location")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {[
                      ["name", "Full name"],
                      ["phone", "Phone"],
                      ["line1", "House / street address"],
                      ["city", "City"],
                      ["state", "State"],
                      ["postalCode", "PIN code"],
                    ].map(([key, placeholder]) => (
                      <TextInput
                        key={key}
                        value={address[key as keyof ShippingAddress]}
                        onChangeText={(value) => updateAddress(key as keyof ShippingAddress, value)}
                        placeholder={t(placeholder)}
                        placeholderTextColor={SCREEN_COLORS.textMuted}
                        style={{ minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, color: SCREEN_COLORS.text, paddingHorizontal: 12, marginBottom: 9, backgroundColor: SCREEN_COLORS.background }}
                      />
                    ))}
                  </View>

                  <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 14, marginTop: 14, gap: 8 }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900", marginBottom: 4 }}>{t("Payment method")}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {[
                        { value: "cod" as const, label: "Cash on Delivery", icon: "cash-outline" as const },
                        { value: "razorpay" as const, label: "Online payment", icon: "card-outline" as const },
                      ].map((method) => {
                        const isSelected = paymentMethod === method.value;
                        return (
                          <TouchableOpacity
                            key={method.value}
                            activeOpacity={0.85}
                            onPress={() => setPaymentMethod(method.value)}
                            style={{
                              flex: 1,
                              minHeight: 48,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                              backgroundColor: isSelected ? SCREEN_COLORS.iconBg : SCREEN_COLORS.background,
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "row",
                              gap: 6,
                              paddingHorizontal: 8,
                            }}
                          >
                            <Ionicons name={method.icon} size={17} color={isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.textMuted} />
                            <Text style={{ color: isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.text, fontSize: 12, fontWeight: "900", textAlign: "center" }}>
                              {t(method.label)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 14, marginTop: 14, gap: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: SCREEN_COLORS.textMuted }}>{t("Subtotal")}</Text>
                      <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>{formatPrice(subtotal)}</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: SCREEN_COLORS.textMuted }}>{t("Delivery")}</Text>
                      <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>{shippingFee ? formatPrice(shippingFee) : t("Free")}</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: SCREEN_COLORS.border, marginVertical: 4 }} />
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900" }}>{t("Total")}</Text>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900" }}>{formatPrice(payableTotal)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={isCheckingOut}
                    onPress={() => void checkout()}
                    style={{ height: 54, borderRadius: 8, backgroundColor: SCREEN_COLORS.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 14, opacity: isCheckingOut ? 0.65 : 1 }}
                  >
                    {isCheckingOut ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Ionicons name={paymentMethod === "cod" ? "cash" : "card"} size={19} color="#fff" />
                    )}
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
                      {paymentMethod === "cod" ? t("Place COD order") : t("Pay online")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
