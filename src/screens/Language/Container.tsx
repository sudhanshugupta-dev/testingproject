import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import LanguageModal from '../../components/LanguageModal';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import { createStyles } from './styles';

const LanguageContainer = () => {
  const [visible, setVisible] = useState(true);
  const lang = useSelector((s: RootState) => s.language.code);
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <Text style={[styles.title, { color: colors.text }]}>{t('language.select')}</Text>
      <Pressable style={styles.row} onPress={() => setVisible(true)}>
        <Text style={[styles.label, { color: colors.text }]}>{lang.toUpperCase()}</Text>
      </Pressable>
      <LanguageModal visible={visible} onClose={() => setVisible(false)} />
    </View>
  );
};


export default LanguageContainer;
