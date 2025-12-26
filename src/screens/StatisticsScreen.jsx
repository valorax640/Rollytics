import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {
  getClasses,
  getAttendance,
  calculateAttendancePercentage,
} from '../utils/storage';
import Header from '../components/Header';

const StatisticsScreen = () => {
  const [stats, setStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSessions: 0,
    averageAttendance: 0,
  });

  const loadStatistics = async () => {
    const classes = await getClasses();
    const allAttendance = await getAttendance();

    let totalStudents = 0;
    let totalPercentage = 0;
    const classStats = [];

    for (const classData of classes) {
      const classAttendance = allAttendance.filter(
        a => a.classId === classData.id,
      );
      const percentage = calculateAttendancePercentage(
        classData.students,
        classAttendance,
      );

      totalStudents += classData.students.length;
      totalPercentage += parseFloat(percentage);

      classStats.push({
        id: classData.id,
        name: classData.name,
        students: classData.students.length,
        sessions: classAttendance.length,
        percentage: percentage,
      });
    }

    setStats(classStats);
    setOverallStats({
      totalClasses: classes.length,
      totalStudents,
      totalSessions: allAttendance.length,
      averageAttendance: 
        classes.length > 0
          ? (totalPercentage / classes.length).toFixed(2)
          : 0,
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, []),
  );

  const getPercentageColor = percentage => {
    if (percentage >= 75) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Statistics" 
        subtitle="Class performance overview" 
      />
      <ScrollView style={styles.content}>
        <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Statistics</Text>
        <View style={styles.overallGrid}>
          <View style={styles.overallItem}>
            <Icon name="school" size={32} color={COLORS.primary} />
            <Text style={styles.overallValue}>{overallStats.totalClasses}</Text>
            <Text style={styles.overallLabel}>Classes</Text>
          </View>
          <View style={styles.overallItem}>
            <Icon name="people" size={32} color={COLORS.secondary} />
            <Text style={styles.overallValue}>{overallStats.totalStudents}</Text>
            <Text style={styles.overallLabel}>Students</Text>
          </View>
          <View style={styles.overallItem}>
            <Icon name="event" size={32} color={COLORS.warning} />
            <Text style={styles.overallValue}>{overallStats.totalSessions}</Text>
            <Text style={styles.overallLabel}>Sessions</Text>
          </View>
          <View style={styles.overallItem}>
            <Icon name="trending-up" size={32} color={COLORS.success} />
            <Text style={styles.overallValue}>
              {overallStats.averageAttendance}%
            </Text>
            <Text style={styles.overallLabel}>Avg Attendance</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class-wise Performance</Text>
        {stats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="insert-chart" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubtext}>
              Add classes and take attendance to see statistics
            </Text>
          </View>
        ) : (
          stats.map(item => (
            <View key={item.id} style={styles.classStatCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{item.name}</Text>
                <Text
                  style={[
                    styles.classPercentage,
                    {color: getPercentageColor(parseFloat(item.percentage))},
                  ]}>
                  {item.percentage}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getPercentageColor(
                        parseFloat(item.percentage),
                      ),
                    },
                  ]}
                />
              </View>
              <View style={styles.classStats}>
                <View style={styles.classStat}>
                  <Icon name="people" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.classStatText}>
                    {item.students} students
                  </Text>
                </View>
                <View style={styles.classStat}>
                  <Icon name="event" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.classStatText}>
                    {item.sessions} sessions
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  overallCard: {
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overallTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  overallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overallItem: {
    width: '48%',
    alignItems: 'center',
    padding: 18,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overallValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  overallLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  classStatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.2,
  },
  classPercentage: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 6,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classStatText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default StatisticsScreen;