import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Session, User } from '../types';
import { clearSession, getSession, getUsers } from '../utils/storage';

export default function HomeScreen(): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<Session | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setCurrentUser(session);

      const allUsers = await getUsers();
      setUsersList(allUsers);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async (): Promise<void> => {
    await clearSession();
    router.replace('/');
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.container}>
        
        {/* Top Navbar / Header Info para sa Mobile */}
        <View style={styles.topBar}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandTitle} numberOfLines={1}>User Management</Text>
              <Text style={styles.welcomeSubtitle} numberOfLines={1}>
                Welcome, <Text style={styles.highlightText}>{currentUser?.fullName || 'User'}</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerLogoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.headerLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Summary Card */}
        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsLabel}>TOTAL REGISTERED USERS</Text>
            <Text style={styles.statsValue}>{usersList.length}</Text>
          </View>
          <View style={styles.statsBadge}>
            <Text style={styles.statsBadgeText}>Active</Text>
          </View>
        </View>

        {/* Directory Registry Card */}
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <Text style={styles.sectionTitle}>Directory Registry</Text>
            <Text style={styles.recordCountText}>{usersList.length} users</Text>
          </View>

          {/* Table Headers (Compact para sa mobile screen) */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, { width: 35 }]}>#</Text>
            <Text style={[styles.headerCell, { flex: 1.4 }]}>Name</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>User</Text>
            <Text style={[styles.headerCell, { flex: 1.6 }]}>Email</Text>
          </View>

          {usersList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No registered users found.</Text>
            </View>
          ) : (
            <FlatList
              data={usersList}
              keyExtractor={(item, index) => item.username || index.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <Text style={[styles.cell, { width: 35 }, styles.textMuted]}>
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </Text>
                  
                  <View style={[styles.cell, { flex: 1.4, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{getInitials(item.fullName)}</Text>
                    </View>
                    <Text style={[styles.textBold, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>
                      {item.fullName}
                    </Text>
                  </View>

                  <Text style={[styles.cell, { flex: 1 }, styles.textLight]} numberOfLines={1}>
                    {item.username}
                  </Text>
                  
                  <Text style={[styles.cell, { flex: 1.6 }, styles.textLight]} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  highlightText: {
    color: '#60A5FA',
    fontWeight: '600',
  },
  headerLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerLogoutText: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statsBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statsBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    padding: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  recordCountText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  listContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  evenRow: {
    backgroundColor: 'transparent',
  },
  oddRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  cell: {
    fontSize: 11,
  },
  textBold: {
    fontWeight: '600',
    color: '#F8FAFC',
    fontSize: 11,
  },
  textLight: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  textMuted: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 10,
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
});