import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloonHeader, { HeaderIcon, HeaderSpace } from '@/components/CloonHeader';
import { Colors } from '@/constants/theme';

export interface HeaderAvatarProps {
  canGoBack?: boolean;
  onBack?: () => void;
  onSave: () => void;
  onShare: () => void;
  unsavedChanges?: boolean;
  scrolled?: boolean;
  onOpenMenu?: () => void; // optional overflow menu
}

const UnsavedDot: React.FC = () => (
  <View style={styles.unsavedDot} />
);

const HeaderAvatar: React.FC<HeaderAvatarProps> = ({
  canGoBack,
  onBack,
  onSave,
  onShare,
  unsavedChanges,
  scrolled,
  onOpenMenu,
}) => {
  const left = canGoBack ? (
    <HeaderIcon name="chevron-back" accessibilityLabel="Back" onPress={onBack} />
  ) : (
    <HeaderSpace width={60} />
  );

  const right = (
    <View style={{ flexDirection: 'row' }}>
      <View>
        <HeaderIcon
          name={unsavedChanges ? 'download' : 'download-outline'}
          accessibilityLabel={unsavedChanges ? 'Save (unsaved changes)' : 'Save'}
          onPress={onSave}
        />
        {unsavedChanges ? <UnsavedDot /> : null}
      </View>
      <HeaderIcon name="share" accessibilityLabel="Share" onPress={onShare} />
      {onOpenMenu ? (
        <HeaderIcon name="ellipsis-horizontal" accessibilityLabel="More options" onPress={onOpenMenu} />
      ) : null}
    </View>
  );

  return <CloonHeader theme="light" scrolled={!!scrolled} left={left} center={<HeaderSpace />} right={right} />;
};

const styles = StyleSheet.create({
  unsavedDot: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
});

export default HeaderAvatar;
