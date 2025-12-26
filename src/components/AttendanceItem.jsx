import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';

const AttendanceItem = ({record, classData}) => {
  const date = new Date(record.date);
  const presentCount = record.attendance.filter(
    a => a.status === 'present',
  ).length;
  const totalCount = record.attendance.length;
  const percentage = ((presentCount / totalCount) * 100).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Icon name="event" size={20} color={COLORS.primary} />
          <Text style={styles.date}>
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Icon name="check-circle" size={18} color={COLORS.success} />
          <Text style={styles.statText}>{presentCount} Present</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="cancel" size={18} color={COLORS.danger} />
          <Text style={styles.statText}>
            {totalCount - presentCount} Absent
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, {width: `${percentage}%`}]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  percentageContainer: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  percentage: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
});

export default AttendanceItem;