import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CloonHeader, { HeaderIcon, HeaderSpace } from '@/components/CloonHeader';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export type ClosetSegment = 'looks' | 'items';
export type ClosetViewMode = 'grid' | 'list';

export interface HeaderClosetProps {
  // Browse mode
  segment: ClosetSegment;
  onSegmentChange: (segment: ClosetSegment) => void;
  viewMode: ClosetViewMode;
  onToggleView: () => void;
  onSearch: () => void;
  scrolled?: boolean;

  // Selection mode
  mode?: 'browse' | 'select';
  selectedCount?: number;
  onCancelSelection?: () => void;
  onShareSelected?: () => void;
  onPostSelected?: () => void;
  onDeleteSelected?: () => void;

  // Empty state
  empty?: boolean;
  onCreateAlbum?: () => void;
}

const SegmentSwitch: React.FC<{ value: ClosetSegment; onChange: (v: ClosetSegment) => void }>
  = ({ value, onChange }) => (
  <View style={styles.segmentWrap}>
    {(['looks', 'items'] as ClosetSegment[]).map((seg) => {
      const active = value === seg;
      return (
        <TouchableOpacity
          key={seg}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${seg}`}
          onPress={() => onChange(seg)}
          style={[styles.segmentBtn, active && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
            {seg === 'looks' ? 'Looks' : 'Items'}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const HeaderCloset: React.FC<HeaderClosetProps> = ({
  segment,
  onSegmentChange,
  viewMode,
  onToggleView,
  onSearch,
  scrolled,
  mode = 'browse',
  selectedCount = 0,
  onCancelSelection,
  onShareSelected,
  onPostSelected,
  onDeleteSelected,
  empty,
  onCreateAlbum,
}) => {
  if (mode === 'select') {
    const left = (
      <TouchableOpacity onPress={onCancelSelection} accessibilityRole="button" accessibilityLabel="Cancel selection">
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    );
    const center = (
      <Text style={styles.selectionText}>{selectedCount} selected</Text>
    );
    const right = (
      <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name="share" accessibilityLabel="Share selected" onPress={onShareSelected} />
        <HeaderIcon name="megaphone-outline" accessibilityLabel="Post selected" onPress={onPostSelected} />
        <HeaderIcon name="trash-outline" accessibilityLabel="Delete selected" onPress={onDeleteSelected} />
      </View>
    );
    return <CloonHeader theme="light" scrolled={!!scrolled} left={left} center={center} right={right} />;
  }

  // Browse mode
  const left = <SegmentSwitch value={segment} onChange={onSegmentChange} />;
  const toggleIcon = viewMode === 'grid' ? 'list' : 'grid';
  const right = empty && onCreateAlbum ? (
    <TouchableOpacity onPress={onCreateAlbum} accessibilityRole="button" accessibilityLabel="Create album" style={styles.createBtn}>
      <Text style={styles.createBtnText}>Create Album</Text>
    </TouchableOpacity>
  ) : (
    <View style={{ flexDirection: 'row' }}>
      <HeaderIcon
        name={toggleIcon as any}
        accessibilityLabel={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        onPress={onToggleView}
      />
      <HeaderIcon name="search-outline" accessibilityLabel="Search in closet" onPress={onSearch} />
    </View>
  );

  return <CloonHeader theme="light" scrolled={!!scrolled} left={left} center={<HeaderSpace />} right={right} />;
};

const styles = StyleSheet.create({
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  segmentBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  segmentBtnActive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: Typography.fontSize.body,
    color: Colors.accent,
    fontWeight: '600',
  },
  selectionText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  createBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.text.primary,
  },
  createBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
  },
});

export default HeaderCloset;
