import { StyleSheet } from 'react-native';
import {useAppTheme } from '../../themes/useTheme'

//const { colors, fonts} = useAppTheme();const colors = useAppTheme();
export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary,
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
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
   elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color:colors.text,
  },
  subText: {
    fontSize: 14,
    color: colors.text,
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
    backgroundColor: colors.primary,
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
  disabledBtn: {
    backgroundColor: colors.disabled || '#cccccc',
    opacity: 0.6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  cancelBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
});
