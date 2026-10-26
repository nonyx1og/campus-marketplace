import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/constants/theme';
import { AppButton } from '@/components/primitives/AppButton';
import { ScreenState } from '@/components/primitives/ScreenState';
import { uploadListingImage, createListing } from '@/lib/api/catalogue';
import {
  compressListingImage,
  CompressedImageResult,
  getUriFileSize,
} from '@/features/listing/imageCompression';
import { ScreenViewState } from '@/types/domain';

const CATEGORY_OPTIONS = [
  'Sách giáo trình',
  'Thiết bị học tập',
  'Đồ dùng phòng trọ',
  'Thể thao & Giải trí',
  'Khác',
];

export default function CreateListingModalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const [title, setTitle] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [stockStr, setStockStr] = useState('1');
  const [category, setCategory] = useState('Sách giáo trình');
  const [location, setLocation] = useState('KTX Khu B');
  const [description, setDescription] = useState('');

  // Image & Compression State
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  /**
   * Handle image compression flow after user picks or shoots a photo
   */
  const processSelectedImage = async (uri: string, rawFileSize?: number) => {
    setIsCompressing(true);
    setErrorMessage('');
    try {
      const rawBytes = rawFileSize && rawFileSize > 0 ? rawFileSize : await getUriFileSize(uri);
      const result = await compressListingImage(uri, rawBytes);
      setCompressedImage(result);
    } catch (err) {
      console.error('Image compression failed:', err);
      Alert.alert(
        'Lỗi nén ảnh',
        'Không thể nén ảnh này. Vui lòng chọn ảnh khác hoặc thử lại.'
      );
    } finally {
      setIsCompressing(false);
    }
  };

  /**
   * Pick image from device library
   */
  const handlePickFromLibrary = async () => {
    setPermissionError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPermissionError('Ứng dụng cần quyền truy cập thư viện ảnh để đăng hình sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1, // Capture full raw quality first; compression handled by expo-image-manipulator
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processSelectedImage(asset.uri, asset.fileSize);
      }
    } catch {
      setErrorMessage('Không thể mở thư viện ảnh. Vui lòng thử lại.');
    }
  };

  /**
   * Capture image directly using camera
   */
  const handleCaptureCamera = async () => {
    setPermissionError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPermissionError('Ứng dụng cần quyền sử dụng máy ảnh để chụp hình sản phẩm trực tiếp.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1, // Full quality raw image before compression
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processSelectedImage(asset.uri, asset.fileSize);
      }
    } catch {
      setErrorMessage('Không thể mở máy ảnh thiết bị. Vui lòng thử lại.');
    }
  };

  /**
   * Submit new listing
   */
  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên món đồ / giáo trình cần đăng.');
      setViewState('error');
      return;
    }

    const priceInt = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceInt) || priceInt <= 0) {
      setErrorMessage('Giá bán phải là số nguyên dương tính theo đơn vị VND.');
      setViewState('error');
      return;
    }

    const stockInt = parseInt(stockStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(stockInt) || stockInt < 0) {
      setErrorMessage('Số lượng tồn kho phải là số nguyên không âm.');
      setViewState('error');
      return;
    }

    // RULE: Photo is strictly required and must be compressed
    if (!compressedImage) {
      setErrorMessage('Sản phẩm bắt buộc phải có ít nhất 1 ảnh đã được nén trước khi upload.');
      setViewState('error');
      return;
    }

    setIsSubmitting(true);
    setViewState('loading');

    try {
      // 1. Upload compressed photo
      const uploadedPhotoUri = await uploadListingImage(compressedImage.compressedUri);

      // 2. Submit listing to remote API / Mock store
      await createListing({
        title: title.trim(),
        category,
        priceVnd: priceInt,
        stock: stockInt,
        campusLocation: location.trim() || 'KTX Khu B',
        description: description.trim(),
        photoUri: uploadedPhotoUri,
        compressedMetrics: {
          rawBytes: compressedImage.metrics.rawBytes,
          compressedBytes: compressedImage.metrics.compressedBytes,
          ratioPercent: compressedImage.metrics.ratioPercent,
        },
      });

      // 3. Invalidate TanStack Query cache to refetch updated catalogue
      await queryClient.invalidateQueries({ queryKey: ['catalogue'] });

      Alert.alert(
        'Đăng tin thành công',
        `Món đồ "${title.trim()}" đã được đăng lên chợ với ảnh đã nén tiết kiệm ${compressedImage.metrics.ratioPercent}% dung lượng!`,
        [
          {
            text: 'Xem chợ ngay',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.';
      setErrorMessage(msg);
      setViewState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setViewState('content');
    setErrorMessage('');
  };

  // Form validity check
  const isFormValid =
    title.trim().length > 0 &&
    priceStr.trim().length > 0 &&
    Boolean(compressedImage) &&
    !isCompressing &&
    !isSubmitting;

  // Dynamic token styles
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const scrollContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
    paddingBottom: 40,
  };

  const formSectionTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  };

  const labelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  };

  const inputStyle: TextStyle = {
    minHeight: theme.layout.minTouchTarget,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  };

  const textAreaStyle: TextStyle = {
    minHeight: 90,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  };

  const categoryChipsContainer: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  };

  const imagePickerRow: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  };

  const imageButton: ViewStyle = {
    flex: 1,
    minHeight: theme.layout.minTouchTarget,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  };

  const imageButtonText: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  };

  const proofCardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  };

  const previewImageStyle: ImageStyle = {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  };

  const proofHeaderStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  };

  const proofRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxs,
  };

  const proofLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const proofValueStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  };

  const badgeProofStyle: ViewStyle = {
    backgroundColor: theme.colors.successBgMuted,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  };

  const badgeProofTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeights.bold,
  };

  const permissionErrorBox: ViewStyle = {
    backgroundColor: theme.colors.dangerBgMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  };

  const permissionErrorText: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.danger,
    marginBottom: theme.spacing.xs,
  };

  const buttonGroupStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={containerStyle}
    >
      <ScreenState
        state={viewState}
        onRetry={handleRetry}
        loadingMessage="Đang nén ảnh & tải tin đăng lên chợ..."
        errorMessage={errorMessage || 'Có lỗi xảy ra khi tạo tin đăng mới.'}
      >
        <ScrollView contentContainerStyle={scrollContentStyle}>
          <Text style={formSectionTitleStyle}>Đăng tin bán đồ sinh viên</Text>

          {/* Title Input */}
          <Text style={labelStyle}>Tên món đồ / giáo trình (*)</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Giáo trình Giải tích 1 Kèm lời giải"
            placeholderTextColor={theme.colors.mutedText}
            style={inputStyle}
            accessibilityRole="text"
            accessibilityLabel="Nhập tên sản phẩm cần đăng bán"
          />

          {/* Price & Stock Row */}
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 2 }}>
              <Text style={labelStyle}>Giá bán (VND) (*)</Text>
              <TextInput
                value={priceStr}
                onChangeText={setPriceStr}
                placeholder="Ví dụ: 75000"
                placeholderTextColor={theme.colors.mutedText}
                keyboardType="number-pad"
                style={inputStyle}
                accessibilityRole="text"
                accessibilityLabel="Nhập giá bán bằng số nguyên VND"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Số lượng (*)</Text>
              <TextInput
                value={stockStr}
                onChangeText={setStockStr}
                placeholder="1"
                placeholderTextColor={theme.colors.mutedText}
                keyboardType="number-pad"
                style={inputStyle}
                accessibilityRole="text"
                accessibilityLabel="Nhập số lượng tồn kho sản phẩm"
              />
            </View>
          </View>

          {/* Category Chips */}
          <Text style={labelStyle}>Danh mục (*)</Text>
          <View style={categoryChipsContainer}>
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Chọn danh mục ${cat}`}
                  style={{
                    minHeight: theme.layout.minTouchTarget,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.radius.pill,
                    backgroundColor: isSelected ? theme.colors.primaryBg : theme.colors.surfaceSubtle,
                    borderWidth: 1,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.borderSubtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.fontSizes.sm,
                      color: isSelected ? theme.colors.textInverse : theme.colors.text,
                      fontWeight: isSelected
                        ? theme.typography.fontWeights.bold
                        : theme.typography.fontWeights.regular,
                    }}
                  >
                    {isSelected ? `✓ ${cat}` : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Photo Selection & Proof of Compression */}
          <Text style={labelStyle}>Hình ảnh sản phẩm (Bắt buộc qua nén ảnh) (*)</Text>

          {/* Permission Error Display with Retry */}
          {permissionError && (
            <View style={permissionErrorBox}>
              <Text style={permissionErrorText}>⚠️ {permissionError}</Text>
              <AppButton
                title="Thử cấp lại quyền"
                variant="outline"
                onPress={handlePickFromLibrary}
                accessibilityLabel="Cấp lại quyền truy cập ảnh"
              />
            </View>
          )}

          {/* Photo Action Buttons */}
          <View style={imagePickerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Chụp ảnh sản phẩm bằng máy ảnh"
              style={imageButton}
              onPress={handleCaptureCamera}
              disabled={isCompressing}
            >
              <Text style={imageButtonText}>📷 Chụp ảnh mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Chọn ảnh sản phẩm từ thư viện"
              style={imageButton}
              onPress={handlePickFromLibrary}
              disabled={isCompressing}
            >
              <Text style={imageButtonText}>🖼️ Thư viện ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Compressing indicator */}
          {isCompressing && (
            <View style={{ alignItems: 'center', marginVertical: theme.spacing.md }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.mutedText }}>
                Đang đo kích thước gốc và nén ảnh (expo-image-manipulator)...
              </Text>
            </View>
          )}

          {/* Proof of Compression Card */}
          {compressedImage && !isCompressing && (
            <View style={proofCardStyle}>
              <Image
                source={{ uri: compressedImage.compressedUri }}
                style={previewImageStyle}
                resizeMode="cover"
                accessibilityLabel="Ảnh sản phẩm đã được nén an toàn"
              />

              <Text style={proofHeaderStyle}>✓ Bằng chứng nén ảnh (Compression Proof)</Text>

              <View style={proofRowStyle}>
                <Text style={proofLabelStyle}>Dung lượng gốc (Raw Photo):</Text>
                <Text style={proofValueStyle}>
                  {compressedImage.metrics.formattedRaw} ({compressedImage.metrics.rawBytes} bytes)
                </Text>
              </View>

              <View style={proofRowStyle}>
                <Text style={proofLabelStyle}>Dung lượng sau nén (Compressed):</Text>
                <Text style={proofValueStyle}>
                  {compressedImage.metrics.formattedCompressed} ({compressedImage.metrics.compressedBytes} bytes)
                </Text>
              </View>

              <View style={proofRowStyle}>
                <Text style={proofLabelStyle}>Tỷ lệ dung lượng tiết kiệm:</Text>
                <Text style={[proofValueStyle, { color: theme.colors.success }]}>
                  Giảm {compressedImage.metrics.ratioPercent}% ({compressedImage.metrics.formattedSaved})
                </Text>
              </View>

              <View style={proofRowStyle}>
                <Text style={proofLabelStyle}>Kích thước hiển thị:</Text>
                <Text style={proofValueStyle}>
                  {compressedImage.width} x {compressedImage.height} px
                </Text>
              </View>

              <View style={badgeProofStyle}>
                <Text style={badgeProofTextStyle}>
                  ✓ Đạt chuẩn: Không upload ảnh raw chưa qua compression
                </Text>
              </View>
            </View>
          )}

          {/* Campus Location Input */}
          <Text style={labelStyle}>Địa điểm giao dịch trong trường</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Ví dụ: KTX Khu B, Căn tin Toà H1"
            placeholderTextColor={theme.colors.mutedText}
            style={inputStyle}
            accessibilityRole="text"
            accessibilityLabel="Nhập địa điểm giao dịch trong khuôn viên trường"
          />

          {/* Description Input */}
          <Text style={labelStyle}>Mô tả chi tiết tình trạng</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả tình trạng độ mới, phụ kiện tặng kèm, lý do sang nhượng..."
            placeholderTextColor={theme.colors.mutedText}
            multiline
            numberOfLines={4}
            style={[inputStyle, textAreaStyle]}
            accessibilityRole="text"
            accessibilityLabel="Nhập mô tả chi tiết sản phẩm"
          />

          {/* Submit / Cancel Buttons */}
          <View style={buttonGroupStyle}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Hủy bỏ"
                variant="secondary"
                onPress={() => router.back()}
                accessibilityLabel="Đóng cửa sổ đăng tin"
              />
            </View>

            <View style={{ flex: 2 }}>
              <AppButton
                title="Đăng tin ngay"
                variant="primary"
                disabled={!isFormValid}
                isLoading={isSubmitting}
                onPress={handleSubmit}
                accessibilityLabel="Xác nhận đăng sản phẩm có ảnh nén lên chợ sinh viên"
              />
            </View>
          </View>
        </ScrollView>
      </ScreenState>
    </KeyboardAvoidingView>
  );
}
