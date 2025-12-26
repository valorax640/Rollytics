import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';

const ClassCard = ({classData, onPress, onDelete}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name="class" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.className}>{classData.name}</Text>
        <Text style={styles.studentCount}>
          {classData.students.length} students
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={e => {
          e.stopPropagation();
          onDelete();
        }}>
        <Icon name="delete-outline" size={24} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  className: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  studentCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});

export default ClassCard;