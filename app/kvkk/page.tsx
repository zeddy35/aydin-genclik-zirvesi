export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-gray-600">
            Kişisel verilerinizin işlenmesi hakkında bilgilendirme
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Veri Sorumlusu
            </h2>
            <p>
              Aydın Gençlik Zirvesi olarak, kişisel verilerinizin işlenmesinden sorumludur.
              Verilerinizle ilgili talepleriniz için bizimle iletişime geçebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. İşlenen Veriler
            </h2>
            <p>
              Kayıt işlemi sırasında aşağıdaki kişisel verileriniz işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Ad Soyad</li>
              <li>E-posta Adresi</li>
              <li>Telefon Numarası</li>
              <li>Okul/Kurum Bilgileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. İşleme Amacı
            </h2>
            <p>
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Etkinliğe katılım yönetimi</li>
              <li>İletişim ve bilgilendirme</li>
              <li>Başvuru ve katılım verilerinin tutulması</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. İşleme Hukuki Dayanağı
            </h2>
            <p>
              Kişisel verilerinizin işlenmesinin hukuki dayanağı, KVKK 5/2-c maddesi
              gereğince açık rızanızdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Verilerin Aktarılması
            </h2>
            <p>
              Kişisel verileriniz, etkinlik organizasyonuyla ilgili üçüncü taraflara
              aktarılabilir. Bu durumda, aktarım yapılan taraf ile ayrı bir veri
              sorumluluğu ilişkisi kurulacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Haklarınız
            </h2>
            <p>
              KVKK 12. madde kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Verileriniz işlenmişse buna ilişkin bilgi isteme</li>
              <li>Verilerinizin silinmesini isteme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Veri Saklama Süresi
            </h2>
            <p>
              Kişisel verileriniz, işleme amacı gerçekleştirilinceye kadar veya
              yasal yükümlülükler gereğince saklanacaktır.
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-gray-700">
              <strong>Not:</strong> Bu metinde yer alan bilgiler örnek mahiyettedir.
              Resmi KVKK metni için yetkili kişilerle iletişime geçiniz.
            </p>
          </section>
        </article>

        {/* Back Button */}
        <div className="mt-12">
          <a
            href="/auth/register"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Kayıt formuna dön
          </a>
        </div>
      </div>
    </div>
  );
}
