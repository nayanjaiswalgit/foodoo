import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { type IAddress } from '@food-delivery/shared';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface AddressPickerProps {
  visible: boolean;
  onClose: () => void;
  addresses: IAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

export function AddressPicker({
  visible,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}: AddressPickerProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select Delivery Address</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {addresses.map((address) => {
              const isSelected = address._id === selectedId;
              return (
                <TouchableOpacity
                  key={address._id}
                  style={[styles.addressItem, isSelected && styles.addressItemSelected]}
                  onPress={() => {
                    onSelect(address._id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.addressContent}>
                    <Text style={styles.addressLabel}>
                      {address.label}
                      {address.isDefault ? ' (Default)' : ''}
                    </Text>
                    <Text style={styles.addressLine}>
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                    </Text>
                    <Text style={styles.addressCity}>
                      {address.city} - {address.pincode}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.addNewBtn} onPress={onAddNew} activeOpacity={0.7}>
            <Text style={styles.addNewText}>+ Add New Address</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xxl,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  list: {
    maxHeight: 300,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  addressItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F0',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  addressCity: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addNewBtn: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    borderStyle: 'dashed',
  },
  addNewText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
