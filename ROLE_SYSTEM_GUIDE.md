# 🔐 Role-Based Access Control System (Turkish)

## Genel Bakış (Overview)

Otel Rezervasyon Sisteminize rol tabanlı erişim kontrolü eklendi! Artık iki farklı kullanıcı rolü var:

### 👔 Yönetici (Manager)
- **Tam yetki** - Tüm özelliklere erişim
- Dashboard'u görebilir
- Hesap ekleyebilir ve silebilir
- Tüm yönetici hesaplarını yönetebilir

### 👨‍💼 Personel (Staff)
- **Sınırlı yetki** - Temel özelliklere erişim
- Dashboard'u göremez ❌
- Hesap ekleyemez veya silemez ❌
- Sadece kendi profilini görüntüleyebilir
- Odalar ve Misafirler sayfalarına tam erişim ✅

---

## 🚀 Nasıl Kullanılır

### 1. **İlk Kurulum - Veritabanını Güncelleyin**

Mevcut bir veritabanınız varsa, önce Role sütununu eklemeniz gerekiyor:

```bash
# MySQL'e giriş yapın
mysql -u root -p

# SQL dosyasını çalıştırın
source add-role-column.sql
```

VEYA manuel olarak şu SQL komutlarını çalıştırın:

```sql
USE hotel_reservation;

-- Role sütununu ekle
ALTER TABLE Managers 
ADD COLUMN Role ENUM('Yönetici', 'Personel') DEFAULT 'Personel' AFTER FullName;

-- Mevcut admin hesabını Yönetici yap
UPDATE Managers 
SET Role = 'Yönetici' 
WHERE Email = 'admin@hotel.com';

-- Diğer tüm mevcut hesapları da Yönetici yap (ilk güncellemede)
UPDATE Managers 
SET Role = 'Yönetici' 
WHERE Role IS NULL;
```

### 2. **Yeni Hesap Ekleme**

Artık hesap eklerken rol seçebilirsiniz:

1. **Ayarlar** sayfasına gidin
2. **"Hesap Ekle"** butonuna tıklayın
3. Bilgileri doldurun:
   - Ad Soyad
   - E-posta
   - Şifre
   - **Rol** (Yönetici veya Personel) 👈 YENİ!
4. **"Hesap Ekle"** ile kaydedin

### 3. **Rolleri Görüntüleme**

Hesap listesinde artık her kullanıcının rolü renkli rozet ile gösteriliyor:
- 🔵 **Mavi rozet** = Yönetici
- 🟢 **Yeşil rozet** = Personel

---

## 📝 Değişiklik Özeti

### Veritabanı Değişiklikleri
- ✅ `Managers` tablosuna `Role` sütunu eklendi
- ✅ `setup-database.sql` güncellendi (yeni kurulumlar için)
- ✅ `add-role-column.sql` oluşturuldu (mevcut veritabanları için)

### Backend Değişiklikleri
- ✅ `electron/main.ts` - Tüm manager handler'ları Role içeriyor
- ✅ `electron/preload.ts` - API tanımları güncellendi
- ✅ `src/types/database.ts` - UserRole tipi ve Manager interface'i güncellendi

### Frontend Değişiklikleri
- ✅ **App.tsx** - Personel için Dashboard gizlendi (3 sidebar)
- ✅ **SettingsPage.tsx** - Role bazlı görünüm:
  - Yönetici: Tam hesap yönetimi
  - Personel: Sadece kendi profili
- ✅ **Add Manager Modal** - Rol seçim dropdown'u eklendi
- ✅ **Manager List** - Rol rozetleri eklendi

### UI Metinleri (Türkçe)
- ✅ "Yönetici (Tam Yetki)" 
- ✅ "Personel (Sınırlı Yetki)"
- ✅ "Hesap Ekle" / "Hesap Çıkar"
- ✅ "Hesap Bilgilerim"
- ✅ Tüm bildirimler ve hata mesajları

---

## 🎯 Erişim Matrisi

| Özellik | Yönetici | Personel |
|---------|----------|----------|
| **Dashboard** | ✅ | ❌ |
| **Odalar (Rooms)** | ✅ | ✅ |
| **Misafirler (Guests)** | ✅ | ✅ |
| **Rezervasyonlar** | ✅ | ✅ |
| **Ayarlar - Hesap Yönetimi** | ✅ (Tam) | ❌ |
| **Ayarlar - Kendi Profili** | ✅ | ✅ (Görüntüleme) |
| **Hesap Ekle/Sil** | ✅ | ❌ |
| **Oda Ekleme/Çıkarma** | ✅ | ✅ |
| **CSV Dışa Aktarma** | ✅ | ✅ |
| **Fatura Yazdırma** | ✅ | ✅ |

---

## 🛠️ Test Senaryosu

### Yönetici Testi:
1. `admin@hotel.com` ile giriş yapın
2. Dashboard'u görebildiğinizi kontrol edin ✅
3. Ayarlar → Tüm hesapları görün ✅
4. Yeni bir Personel hesabı ekleyin ✅

### Personel Testi:
1. Yeni oluşturduğunuz Personel hesabı ile giriş yapın
2. Dashboard butonunu görmediğinizi kontrol edin ❌
3. Odalar ve Misafirler sayfalarına erişebildiğinizi kontrol edin ✅
4. Ayarlar → Sadece kendi profilinizi gördüğünüzü kontrol edin ✅
5. "Hesap Ekle" butonunu görmediğinizi kontrol edin ❌

---

## 💡 İpuçları

1. **İlk Yönetici**: Admin hesabı (`admin@hotel.com`) otomatik olarak Yönetici rolüyle oluşturulur

2. **Güvenlik**: En az bir Yönetici hesabı olmalıdır. Son Yönetici hesabı silinemez.

3. **Rol Değiştirme**: Şu anda mevcut hesapların rolünü değiştirmek için veritabanından manuel olarak güncellenmelidir:
   ```sql
   UPDATE Managers SET Role = 'Yönetici' WHERE Email = 'kullanici@email.com';
   ```

4. **Yeni Kurulum**: `setup-database.sql` kullanılarak yapılan yeni kurulumlar otomatik olarak Role sütununu içerir.

---

## 📞 Sorun Giderme

### Problem: "Role column doesn't exist" hatası
**Çözüm**: `add-role-column.sql` dosyasını çalıştırın.

### Problem: Admin hesabı Personel görünüyor
**Çözüm**: 
```sql
UPDATE Managers SET Role = 'Yönetici' WHERE Email = 'admin@hotel.com';
```

### Problem: Personel Dashboard'u görebiliyor
**Çözüm**: Uygulamayı yeniden başlatın (`npm run dev`)

---

## ✨ Gelecek Geliştirmeler

- [ ] UI'dan rol değiştirme özelliği
- [ ] Daha detaylı izinler (örn: sadece odaları görebilir)
- [ ] Aktivite logları (kim ne yaptı?)
- [ ] Personel için özel raporlar

---

**Tebrikler! 🎉** Rol tabanlı erişim kontrolü sisteminiz hazır ve çalışıyor!

