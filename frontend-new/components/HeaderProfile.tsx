import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CloonHeader, { HeaderIcon, HeaderSpace } from '@/components/CloonHeader';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export interface HeaderProfileProps {
  username: string;
  isSelf?: boolean;
  onSettings: () => void;
  onEditProfile?: () => void;
  onCopyUsername?: (username: string) => void;
  scrolled?: boolean;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  username,
  isSelf,
  onSettings,
  onEditProfile,
  onCopyUsername,
  scrolled,
}) => {
  const center = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Copy @${username}`}
      onPress={() => onCopyUsername?.(username)}
      style={styles.usernameWrap}
    >
      <Text style={styles.username}>@{username}</Text>
    </TouchableOpacity>
  );

  const right = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {isSelf && onEditProfile ? (
        <TouchableOpacity onPress={onEditProfile} accessibilityLabel="Edit Profile" style={styles.editBtn}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : null}
      <HeaderIcon name="settings-outline" accessibilityLabel="Settings" onPress={onSettings} />
    </View>
  );

  return <CloonHeader theme="light" scrolled={!!scrolled} left={<HeaderSpace width={60} />} center={center} right={right} />;
};

const styles = StyleSheet.create({
  usernameWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  username: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  editText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
  },
});

export default HeaderProfile;
