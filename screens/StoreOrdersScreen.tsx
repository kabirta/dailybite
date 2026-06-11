import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { listMyStoreOrders } from "../src/services/backendApi";

type StoreOrderItem = {
  name: string;
  quantity: number;
  lineTotal?: number;
  image?: string;
  price?: number;
};

type StoreOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentProvider?: string;
  subtotal?: number;
  shippingFee?: number;
  tax?: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  items?: StoreOrderItem[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80";

function formatPrice(price: number) {
  return `Rs ${Number(price || 0).toLocaleString("en-IN")}`;
}

function formatOrderDate(value?: string) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getPaymentLabel(provider?: string) {
  return provider === "cod" ? "Cash on Delivery" : "Online payment";
}

function getPaymentState(order: StoreOrder) {
  if (order.paymentProvider === "cod") return "Pay on delivery";
  if (order.status === "payment_failed") return "Payment failed";
  if (order.status === "pending_payment") return "Payment pending";
  return "Paid online";
}

function getItemCount(order: StoreOrder) {
  return (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function getAddressLine(order: StoreOrder) {
  const address = order.shippingAddress || {};
  return [address.line1, address.line2, address.city, address.state, address.postalCode]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

function getStatusMeta(status: string) {
  const map: Record<
    string,
    {
      label: string;
      description: string;
      color: string;
      bg: string;
      icon: React.ComponentProps<typeof Ionicons>["name"];
      progress: number;
    }
  > = {
    pending_payment: {
      label: "Payment pending",
      description: "Complete payment to confirm this order.",
      color: "#B45309",
      bg: "#FEF3C7",
      icon: "time-outline",
      progress: 15,
    },
    paid: {
      label: "Order confirmed",
      description: "Payment received. Seller is preparing your order.",
      color: "#2563EB",
      bg: "#DBEAFE",
      icon: "checkmark-circle-outline",
      progress: 35,
    },
    processing: {
      label: "Processing",
      description: "Your items are being packed for dispatch.",
      color: "#7C3AED",
      bg: "#EDE9FE",
      icon: "cube-outline",
      progress: 55,
    },
    shipped: {
      label: "Shipped",
      description: "Your order is on the way.",
      color: "#0284C7",
      bg: "#E0F2FE",
      icon: "bicycle-outline",
      progress: 80,
    },
    delivered: {
      label: "Delivered",
      description: "Delivered successfully.",
      color: "#047857",
      bg: "#D1FAE5",
      icon: "checkmark-done-circle-outline",
      progress: 100,
    },
    cancelled: {
      label: "Cancelled",
      description: "This order was cancelled.",
      color: "#DC2626",
      bg: "#FEE2E2",
      icon: "close-circle-outline",
      progress: 100,
    },
    payment_failed: {
      label: "Payment failed",
      description: "Payment could not be verified.",
      color: "#DC2626",
      bg: "#FEE2E2",
      icon: "alert-circle-outline",
      progress: 100,
    },
  };

  return (
    map[String(status || "").toLowerCase()] || {
      label: "Order placed",
      description: "We are checking the latest status.",
      color: SCREEN_COLORS.primary,
      bg: SCREEN_COLORS.iconBg,
      icon: "receipt-outline",
      progress: 35,
    }
  );
}

function StatusTimeline({ status }: { status: string }) {
  const { t } = useLanguage();
  const current = getStatusMeta(status);
  const steps = [
    { label: "Confirmed", threshold: 30 },
    { label: "Packed", threshold: 55 },
    { label: "Shipped", threshold: 80 },
    { label: "Delivered", threshold: 100 },
  ];

  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ height: 7, borderRadius: 999, backgroundColor: "#DDEBFA", overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${current.progress}%`, borderRadius: 999, backgroundColor: current.color }} />
      </View>
      <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
        {steps.map((step) => (
          <Text
            key={step.label}
            style={{
              color: current.progress >= step.threshold ? current.color : SCREEN_COLORS.textMuted,
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            {t(step.label)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_COLORS.cardSoft, borderRadius: 8, padding: 10 }}>
      <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 10, fontWeight: "900", textTransform: "uppercase" }}>{t(label)}</Text>
      <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "900", marginTop: 5 }} numberOfLines={1}>
        {t(value)}
      </Text>
    </View>
  );
}

function OrderCard({
  order,
  expanded,
  onToggleExpanded,
  onShopAgain,
}: {
  order: StoreOrder;
  expanded: boolean;
  onToggleExpanded: () => void;
  onShopAgain: () => void;
}) {
  const { t } = useLanguage();
  const status = getStatusMeta(order.status);
  const items = order.items || [];
  const firstItem = items[0];
  const visibleItems = expanded ? items : items.slice(1, 4);
  const hiddenCount = expanded ? 0 : Math.max(items.length - 4, 0);
  const addressLine = getAddressLine(order);
  const subtotal = Number(order.subtotal ?? Math.max(Number(order.total || 0) - Number(order.shippingFee || 0) - Number(order.tax || 0), 0));
  const shippingFee = Number(order.shippingFee || 0);
  const tax = Number(order.tax || 0);

  return (
    <View style={{ backgroundColor: SCREEN_COLORS.card, borderWidth: 1, borderColor: SCREEN_COLORS.border, borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
      <View style={{ height: 4, backgroundColor: status.color }} />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }}>{t("Order ID")}</Text>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 17, fontWeight: "900", marginTop: 3 }} numberOfLines={1}>
              {order.orderNumber}
            </Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 4, fontSize: 12 }}>
              {t("Placed")} {formatOrderDate(order.createdAt)}
            </Text>
          </View>
          <View style={{ backgroundColor: status.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" }}>
            <Ionicons name={status.icon} size={15} color={status.color} />
            <Text style={{ color: status.color, fontSize: 12, fontWeight: "900" }}>{t(status.label)}</Text>
          </View>
        </View>

        <StatusTimeline status={order.status} />
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "800", marginTop: 10 }}>
          {t(status.description)}
        </Text>

        <View style={{ marginTop: 14, flexDirection: "row", gap: 12 }}>
          <Image
            source={{ uri: firstItem?.image || FALLBACK_IMAGE }}
            style={{ width: 90, height: 90, borderRadius: 8, backgroundColor: SCREEN_COLORS.cardSoft }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "900" }} numberOfLines={2}>
              {firstItem?.name || t("Store order")}
            </Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 5 }}>
              {getItemCount(order)} {getItemCount(order) === 1 ? t("item") : t("items")} - {t(getPaymentLabel(order.paymentProvider))}
            </Text>
            <Text style={{ color: SCREEN_COLORS.primary, fontSize: 17, fontWeight: "900", marginTop: 8 }}>
              {formatPrice(order.total)}
            </Text>
          </View>
        </View>

        {visibleItems.length || hiddenCount ? (
          <View style={{ marginTop: 12, backgroundColor: SCREEN_COLORS.cardSoft, borderRadius: 8, padding: 10, gap: 7 }}>
            {visibleItems.map((item, index) => (
              <View key={`${order._id}-${item.name}-${index}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <Text style={{ color: SCREEN_COLORS.text, flex: 1, fontSize: 12, fontWeight: "700" }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "800" }}>x{item.quantity}</Text>
              </View>
            ))}
            {hiddenCount ? (
              <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "900" }}>
                +{hiddenCount} {t(hiddenCount > 1 ? "more items" : "more item")}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <InfoTile label="Payment" value={getPaymentState(order)} />
          <InfoTile label="Delivery" value={status.progress >= 100 ? status.label : "Standard"} />
          <InfoTile label="Items" value={String(getItemCount(order) || items.length)} />
        </View>

        <View style={{ marginTop: 14, backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: SCREEN_COLORS.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="wallet-outline" size={18} color={SCREEN_COLORS.primary} />
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "900" }}>{t("Payment summary")}</Text>
          </View>
          <View style={{ marginTop: 10, gap: 7 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>{t("Items subtotal")}</Text>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, fontWeight: "800" }}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>{t("Delivery fee")}</Text>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, fontWeight: "800" }}>{shippingFee ? formatPrice(shippingFee) : t("Free")}</Text>
            </View>
            {tax ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>{t("Tax")}</Text>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, fontWeight: "800" }}>{formatPrice(tax)}</Text>
              </View>
            ) : null}
            <View style={{ height: 1, backgroundColor: SCREEN_COLORS.border, marginVertical: 2 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "900" }}>{t("Order total")}</Text>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "900" }}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>

        {expanded ? (
          <View style={{ marginTop: 12, backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: SCREEN_COLORS.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="location-outline" size={18} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "900" }}>{t("Delivery details")}</Text>
            </View>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "800", marginTop: 9 }}>
              {order.shippingAddress?.name || t("Customer")}
            </Text>
            {order.shippingAddress?.phone ? (
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 3 }}>{order.shippingAddress.phone}</Text>
            ) : null}
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 }}>
              {addressLine || t("Delivery address not available")}
            </Text>
          </View>
        ) : addressLine ? (
          <View style={{ marginTop: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <Ionicons name="location-outline" size={18} color={SCREEN_COLORS.primary} />
            <Text style={{ color: SCREEN_COLORS.textMuted, flex: 1, fontSize: 12, lineHeight: 17 }} numberOfLines={2}>
              {addressLine}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: SCREEN_COLORS.border, padding: 12, flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onToggleExpanded}
          style={{ flex: 1, height: 42, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}
        >
          <Ionicons name={expanded ? "chevron-up" : "document-text-outline"} size={17} color={SCREEN_COLORS.primary} />
          <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "900" }}>{expanded ? t("Less info") : t("Details")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onShopAgain}
          style={{ flex: 1, height: 42, borderRadius: 8, backgroundColor: SCREEN_COLORS.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}
        >
          <Ionicons name="bag-add-outline" size={17} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "900" }}>{t("Shop again")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function StoreOrdersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = orders.filter((order) => !["delivered", "cancelled", "payment_failed"].includes(order.status));
    const delivered = orders.filter((order) => order.status === "delivered");
    return { active: active.length, delivered: delivered.length };
  }, [orders]);

  const filters = useMemo(
    () => [
      { key: "all", label: "All", count: orders.length },
      { key: "active", label: "Active", count: totals.active },
      { key: "delivered", label: "Delivered", count: totals.delivered },
      { key: "cod", label: "COD", count: orders.filter((order) => order.paymentProvider === "cod").length },
    ],
    [orders, totals.active, totals.delivered]
  );

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "active" && !["delivered", "cancelled", "payment_failed"].includes(order.status)) ||
        (selectedFilter === "delivered" && order.status === "delivered") ||
        (selectedFilter === "cod" && order.paymentProvider === "cod");

      if (!matchesFilter) return false;
      if (!search) return true;

      const itemText = (order.items || []).map((item) => item.name).join(" ");
      return [order.orderNumber, order.status, getPaymentLabel(order.paymentProvider), itemText]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [orders, query, selectedFilter]);

  const loadOrders = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setMessage("");

    try {
      const data = await listMyStoreOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setMessage(error?.message || t("Could not load your orders."));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadOrders({ refreshing: true })} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 132 }}
        >
          <View style={{ paddingTop: 16, paddingBottom: 14 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <Ionicons name="chevron-back" size={20} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "900" }}>{t("Back")}</Text>
            </TouchableOpacity>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 30, fontWeight: "900" }}>{t("My Orders")}</Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 20, marginTop: 7 }}>
              {t("Track every pharmacy order, payment, delivery address, and item in one place.")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <InfoTile label="Total" value={String(orders.length)} />
              <InfoTile label="Active" value={String(totals.active)} />
              <InfoTile label="Delivered" value={String(totals.delivered)} />
            </View>

            <View style={{ height: 48, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, backgroundColor: SCREEN_COLORS.card, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8, marginTop: 14 }}>
              <Ionicons name="search-outline" size={18} color={SCREEN_COLORS.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t("Search by product, order ID, status...")}
                placeholderTextColor={SCREEN_COLORS.textMuted}
                style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 14 }}
              />
              {query ? (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={18} color={SCREEN_COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
              {filters.map((filter) => {
                const isSelected = selectedFilter === filter.key;
                return (
                  <TouchableOpacity
                    key={filter.key}
                    activeOpacity={0.85}
                    onPress={() => setSelectedFilter(filter.key)}
                    style={{
                      minHeight: 38,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                      borderWidth: 1,
                      borderColor: isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                    }}
                  >
                    <Text style={{ color: isSelected ? "#fff" : SCREEN_COLORS.text, fontSize: 13, fontWeight: "900" }}>
                      {t(filter.label)} ({filter.count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 12 }}>{t("Loading orders")}</Text>
            </View>
          ) : message ? (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 18 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900" }}>{t("Could not load orders")}</Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 6 }}>{message}</Text>
            </View>
          ) : filteredOrders.length ? (
            <View>
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  expanded={expandedOrderId === order._id}
                  onToggleExpanded={() => setExpandedOrderId((current) => (current === order._id ? null : order._id))}
                  onShopAgain={() => router.push("/store")}
                />
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, alignItems: "center", padding: 26, marginTop: 8 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: SCREEN_COLORS.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="receipt-outline" size={38} color={SCREEN_COLORS.primary} />
              </View>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 19, fontWeight: "900", marginTop: 14 }}>
                {orders.length ? t("No matching orders") : t("No orders yet")}
              </Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, textAlign: "center", lineHeight: 20, marginTop: 7 }}>
                {orders.length
                  ? t("Try another search or filter to find your order.")
                  : t("Start shopping medicines and wellness products. Your order tracking will show here.")}
              </Text>
              <TouchableOpacity onPress={() => router.push("/store")} style={{ height: 46, borderRadius: 8, backgroundColor: SCREEN_COLORS.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, marginTop: 18 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }}>{t("Shop now")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
