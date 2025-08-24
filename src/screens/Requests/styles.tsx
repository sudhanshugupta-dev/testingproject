import { StyleSheet } from 'react-native';
// import {useAppTheme } from '../../themes/useTheme'

// const { colors, fonts} = useAppTheme();
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  acceptBtn: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  declineBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  requestBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#333',
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
