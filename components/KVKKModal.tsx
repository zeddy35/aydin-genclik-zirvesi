"use client";

import { useState } from "react";

export function KVKKModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">KVKK Aydınlatma Metni</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-gray-700 space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                KİŞİSEL VERİLERİN KORUNMASI HAKKINDA AYDINLATMA METNİ
              </h3>
              <p className="text-sm text-gray-600">
                Aydın Gençlik Zirvesi olarak, kişisel verilerinizin korunması ve işlenmesine
                ilişkin 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
                aşağıdaki bilgileri sunmaktayız.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">1. Veri Sorumlusu</h4>
              <p>
                Aydın Gençlik Zirvesi tarafından yürütülen bu etkinlik kapsamında, sizin
                tarafınızdan sağlanan kişisel verileriniz için veri sorumlusu konumundayız.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">2. İşlenen Kişisel Veriler</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Ad Soyad</li>
                <li>E-posta Adresi</li>
                <li>Telefon Numarası</li>
                <li>Okul/Kurum Adı</li>
                <li>Bölüm/Alanı</li>
                <li>Yaş Grubu</li>
                <li>Şehir</li>
                <li>Tecrübe Seviyesi</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">3. Verilerin İşleme Amacı</h4>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Etkinliğe katılım yönetimi ve organizasyonu</li>
                <li>Katılımcılar arasında iletişim sağlanması</li>
                <li>Başvuru ve katılım belgelerinin tutulması</li>
                <li>Başvuru durumu bilgilendirmesi</li>
                <li>Etkinlik sonrası geri bildirim alınması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                4. Verilerin İşlenmesinin Hukuki Dayanağı
              </h4>
              <p>
                Kişisel verilerinizin işlenmesi, KVKK 5. madde 2. bendinin (c) fıkrasında
                belirtilen "sözleşmenin kurulması veya ifası için gerekli olan veriler" ile
                (a) fıkrasında belirtilen "ilgili kişinin açık rızası" hukuki dayanağına
                dayanmaktadır. Kayıt işlemi sırasında bu formu onayladığınızda, kişisel
                verilerinizin işlenmesine açık rıza vermiş olmaktasınız.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">5. Verilerin Aktarılması</h4>
              <p>
                Kişisel verileriniz, etkinlik organizasyonuyla ilgili ihtiyaç duyulan üçüncü
                taraflara (etkinlik ortakları, sponsorlar, hukuk müşaviri vb.) aktarılabilir.
                Bu durumda, aktarım yapılan taraf ile ayrı bir veri sorumluluğu ilişkisi
                kurulacaktır.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                6. Haklar (KVKK 12. Madde)
              </h4>
              <p>Aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Verileriniz işlenmişse buna ilişkin bilgi isteme</li>
                <li>Verilerinizin işlenmesinin amacını ve hukuki dayanağını öğrenme</li>
                <li>Verilerinizin düzeltilmesini isteme</li>
                <li>Verilerinizin silinmesini isteme</li>
                <li>Verilerin işlenmesinin kısıtlanmasını isteme</li>
                <li>Verilerinize ilişkin itiraz etme</li>
                <li>Verilerinizin silinmesi veya işlenmesinin kısıtlanması halinde bunu
                  haber alan kişilere bu kararın iletilmesini isteme</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">7. Veri Saklama Süresi</h4>
              <p>
                Kişisel verileriniz, işleme amacı gerçekleştirilinceye kadar ve ilgili
                kanunlar gereğince saklı tutulacaktır. Etkinlik sonrasında da belge
                saklama yükümlülükleri nedeniyle belirli bir süre muhafaza edilecektir.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">8. Otomasyonlu Karar Verme</h4>
              <p>
                Kişisel verileriniz, tamamen otomasyonlu araçlarla ve sizi hukuki ya da
                ekonomik açıdan önemli ölçüde etkileyebilecek kararlar almak için işlenmemektedir.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">9. Güvenlik Tedbirleri</h4>
              <p>
                Kişisel verilerinizin güvenliğini sağlamak amacıyla uygun teknolojik ve
                idari önlemler alınmaktadır. Verilere yetkisiz erişim, değiştirilme,
                kullanıma açılma ve kaybından korunması için gerekli tüm tedbirler
                alınmaktadır.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-900 mb-2">10. İletişim</h4>
              <p>
                Verilerinize ilişkin hakları kullanmak veya herhangi bir sorunuz için lütfen
                bizimle iletişime geçiniz. Kişisel Veri Koruma Kanunu hakkında daha detaylı
                bilgi için www.kvkk.gov.tr adresini ziyaret edebilirsiniz.
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>Onay Sözleşmesi:</strong> Bu formu göndererek, yukarıdaki KVKK
                Aydınlatma Metni'ni okuduğunuzu ve kişisel verilerinizin belirtilen
                amaçlarla işlenmesine açık rıza verdiğinizi kabul etmiş olursunuz.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
