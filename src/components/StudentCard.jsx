import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';

const StudentCard = ({student, stats, onDelete}) => {
  const percentage = stats ?  parseFloat(stats.percentage) : 0;
  const getPercentageColor = () => {
    if (percentage >= 75) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="person" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.studentName}>{student.name}</Text>
        {stats && (
          <Text style={styles.attendanceInfo}>
            {stats.present}/{stats.total} sessions attended
          </Text>
        )}
      </View>
      {stats && stats.total > 0 && (
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, {color: getPercentageColor()}]}>
            {stats.percentage}%
          </Text>
        </View>
      )}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}>
          <Icon name="delete-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  attendanceInfo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  percentageContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default StudentCard;