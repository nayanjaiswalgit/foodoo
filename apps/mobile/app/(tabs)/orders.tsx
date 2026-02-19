import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { type IOrder } from '@food-delivery/shared';
import { orderApi } from '../../src/services/order.service';
import { OrderCard } from '../../src/components/order/OrderCard';
import { EmptyState } from '../../src/components/ui';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function OrdersScreen() {
  const { data, fetchNextPage, hasNextPage, isLoading, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['myOrders'],
    queryFn: ({ pageParam = 1 }) => orderApi.getMyOrders(pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const orders = data?.pages.flatMap((p) => p.data) ?? [];

  const renderItem = ({ item }: { item: IOrder }) => <OrderCard order={item} />;

  if (!isLoading && orders.length === 0) {
    return <EmptyState title="No orders yet" message="Your order history will appear here" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
});
