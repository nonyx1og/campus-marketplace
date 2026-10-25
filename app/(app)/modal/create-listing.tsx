import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { Tokens } from '@/constants/tokens';
import { ScreenViewState } from '@/types/listing';

export default function CreateListingModalScreen() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const [title, setTitle] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [category, setCategory] = useState('Sách giáo trình');
  const [location, setLocation] = useState('KTX Khu B');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên món đồ cần đăng.');
      setViewState('error');
      return;
    }

    const priceInt = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceInt) || priceInt <= 0) {
      setErrorMessage('Giá bán phải là số nguyên dương (VND).');
      setViewState('error');
      return;
    }

    setIsSubmitting(true);
    setViewState('loading');

    try {
      // Simulate API create listing mutation
      await new Promise((resolve) => setTimeout(resolve, 800));

      Alert.alert('Thành công', 'Tin đăng của bạn đã được duyệt và đăng lên Campus Marketplace!', [
        {
          text: 'Đóng',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      setErrorMessage('Không thể đăng tin lúc này. Vui lòng thử lại sau.');
      setViewState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setViewState('content');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScreenStateView
        state={viewState}
        onRetry={handleRetry}
        onStateChange={setViewState}
        loadingMessage="Đang xử lý đăng tin rao vặt..."
        emptyTitle="Chưa có thông tin đăng tin"
        emptyMessage="Hãy điền các thông tin bên dưới để đưa sản phẩm đến với bạn bè trong trường."
        errorMessage={errorMessage || 'Có lỗi xảy ra khi tạo tin đăng mới.'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.formSectionTitle}>Thông tin đồ dùng</Text>

          <Text style={styles.label}>Tên sản phẩm / đồ dùng (*)</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Giáo trình Đại số tuyến tính"
            placeholderTextColor={Tokens.colors.textMuted}
            style={styles.input}
            accessibilityRole="text"
            accessibilityLabel="Nhập tên sản phẩm cần bán"
          />

          <Text style={styles.label}>Giá bán (VND - số nguyên) (*)</Text>
          <TextInput
            value={priceStr}
            onChangeText={setPriceStr}
            placeholder="Ví dụ: 50000"
            placeholderTextColor={Tokens.colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
            accessibilityRole="text"
            accessibilityLabel="Nhập giá bán bằng số nguyên VND"
          />

          <Text style={styles.label}>Danh mục</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Ví dụ: Sách giáo trình, Thiết bị học tập"
            placeholderTextColor={Tokens.colors.textMuted}
            style={styles.input}
            accessibilityRole="text"
            accessibilityLabel="Nhập danh mục sản phẩm"
          />

          <Text style={styles.label}>Địa điểm giao dịch trong trường</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Ví dụ: Căn tin Toà H1, KTX Khu A"
            placeholderTextColor={Tokens.colors.textMuted}
            style={styles.input}
            accessibilityRole="text"
            accessibilityLabel="Nhập địa điểm hẹn gặp giao dịch"
          />

          <Text style={styles.label}>Mô tả chi tiết tình trạng đồ dùng</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả độ mới, chức năng, phụ kiện đi kèm..."
            placeholderTextColor={Tokens.colors.textMuted}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            accessibilityRole="text"
            accessibilityLabel="Nhập mô tả chi tiết sản phẩm"
          />

          <View style={styles.buttonGroup}>
            <Button
              title="Hủy bỏ"
              variant="secondary"
              onPress={() => router.back()}
              accessibilityLabel="Đóng cửa sổ đăng tin"
              style={styles.cancelBtn}
            />
            <Button
              title="Đăng tin ngay"
              variant="primary"
              isLoading={isSubmitting}
              onPress={handleSubmit}
              accessibilityLabel="Xác nhận đăng tin lên chợ sinh viên"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </ScreenStateView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
  },
  scrollContent: {
    padding: Tokens.spacing.screenPadding,
  },
  formSectionTitle: {
    fontSize: Tokens.typography.fontSizes.lg,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.md,
  },
  label: {
    fontSize: Tokens.typography.fontSizes.sm,
    fontWeight: Tokens.typography.fontWeights.medium,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xxs,
  },
  input: {
    minHeight: Tokens.layout.minTouchTarget,
    borderWidth: 1,
    borderColor: Tokens.colors.borderStrong,
    borderRadius: Tokens.borderRadius.md,
    paddingHorizontal: Tokens.spacing.md,
    fontSize: Tokens.typography.fontSizes.md,
    color: Tokens.colors.textPrimary,
    backgroundColor: Tokens.colors.surface,
    marginBottom: Tokens.spacing.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Tokens.spacing.sm,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Tokens.spacing.md,
    marginTop: Tokens.spacing.sm,
    marginBottom: Tokens.spacing.xl,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
