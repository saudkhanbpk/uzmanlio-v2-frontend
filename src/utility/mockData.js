// Mock blog data
export const mockBlogPosts = [
  {
    id: 1,
    title: "Etkili Psikolojik Danışmanlık Teknikleri",
    content: `# Danışmanlık Süreci

Etkili psikolojik danışmanlık için temel yaklaşımlar ve teknikler vardır. Bu yazıda size en önemli noktaları paylaşacağım.

## Temel Yaklaşımlar

- **Empatik dinleme**: Danışanın duygularını anlama
- **Aktif geri bildirim**: Anlaşıldığını hissettirme
- **Soru sorma teknikleri**: Doğru soruları sorma

## Pratik Uygulamalar

Danışmanlık sürecinde kullanabileceğiniz pratik teknikler:

1. İlk görüşmede güven oluşturma
2. Hedef belirleme süreçleri
3. İlerleme takibi

**Sonuç olarak**, doğru yaklaşımlarla etkili danışmanlık hizmeti verebilirsiniz.`,
    category: "Psikoloji",
    keywords: ["psikoloji", "danışmanlık", "terapi", "gelişim"],
    status: "published",
    slug: "etkili-psikolojik-danismanlik-teknikleri",
    createdAt: "2024-06-15",
    updatedAt: "2024-06-15",
    author: "Ahmet Yılmaz"
  },
  {
    id: 2,
    title: "Beslenme ve Zihinsel Sağlık İlişkisi",
    content: `# Beslenme Alışkanlıkları

Doğru beslenme ile zihinsel sağlığımızı nasıl destekleyebiliriz? Bu konuda bilmeniz gerekenler:

## Önemli Besin Öğeleri

- **Omega-3 yağ asitleri**: Beyin sağlığı için kritik
- **B vitamini kompleksi**: Sinir sistemini destekler
- **Magnezyum**: Stres azaltımında etkili

### Günlük Öneriler

1. Bol su tüketin (günde en az 2 litre)
2. Sebze ve meyve çeşitliliğini artırın
3. İşlenmiş gıdaları azaltın

*Beslenme alışkanlıklarınızı yavaş yavaş değiştirin ve sonuçları gözlemleyin.*`,
    category: "Beslenme", 
    keywords: ["beslenme", "sağlık", "zihin", "vitamin"],
    status: "published",
    slug: "beslenme-ve-zihinsel-saglik-iliskisi",
    createdAt: "2024-06-10",
    updatedAt: "2024-06-12",
    author: "Ahmet Yılmaz"
  },
  {
    id: 3,
    title: "Dijital Çağda Kişisel Gelişim",
    content: `# Modern Yaklaşımlar

Teknolojinin gelişimi ile birlikte kişisel gelişim alanındaki yenilikler nelerdir?

## Dijital Araçlar

- **Mobil uygulamalar**: Habit tracking ve meditasyon
- **Online kurslar**: Uzaktan öğrenme imkanları
- **Sosyal medya**: Motivasyon ve topluluk desteği

### Dikkat Edilmesi Gerekenler

Teknoloji kullanırken dikkat etmeniz gereken noktalar:

1. **Ekran süresi kontrolü**
2. **Doğru kaynak seçimi**
3. **Dengeli yaklaşım**

Bu yazı henüz taslak halindedir ve yakında tamamlanacaktır.`,
    category: "Kişisel Gelişim",
    keywords: ["kişisel gelişim", "teknoloji", "dijital", "gelişim"],
    status: "draft",
    slug: "dijital-cagda-kisisel-gelisim",
    createdAt: "2024-06-05",
    updatedAt: "2024-06-05",
    author: "Ahmet Yılmaz"
  }
];


// Mock Forms Data
export const mockForms = [
  {
    id: 1,
    title: "Kişilik Değerlendirme Testi",
    description: "Danışanların kişilik özelliklerini değerlendirmek için hazırlanmış kapsamlı test.",
    status: "active",
    participantCount: 127,
    createdAt: "2024-06-15",
    updatedAt: "2024-06-20",
    fields: [
      {
        id: 1,
        type: "text",
        label: "Adınız ve Soyadınız",
        required: true,
        placeholder: "Tam adınızı yazınız"
      },
      {
        id: 2,
        type: "email",
        label: "E-posta Adresiniz",
        required: true,
        placeholder: "ornek@email.com"
      },
      {
        id: 3,
        type: "single-choice",
        label: "Yaş aralığınız nedir?",
        required: true,
        options: ["18-25", "26-35", "36-45", "46-55", "55+"]
      },
      {
        id: 4,
        type: "multiple-choice",
        label: "Hangi alanlarda gelişim göstermek istiyorsunuz? (Birden fazla seçebilirsiniz)",
        required: false,
        options: ["İletişim", "Liderlik", "Stres Yönetimi", "Zaman Yönetimi", "Duygusal Zeka", "Öz Güven"]
      },
      {
        id: 5,
        type: "ranking",
        label: "Aşağıdaki değerleri kendiniz için önem sırasına göre sıralayınız (1 en önemli)",
        required: true,
        options: ["Aile", "Kariyer", "Sağlık", "Para", "Mutluluk"]
      }
    ]
  },
  {
    id: 2,
    title: "Müşteri Memnuniyet Anketi",
    description: "Hizmet kalitemizi değerlendirmek için hazırlanmış anket formu.",
    status: "active",
    participantCount: 89,
    createdAt: "2024-06-10",
    updatedAt: "2024-06-18",
    fields: [
      {
        id: 1,
        type: "text",
        label: "Adınız (İsteğe bağlı)",
        required: false,
        placeholder: "Adınızı yazabilirsiniz"
      },
      {
        id: 2,
        type: "single-choice",
        label: "Genel memnuniyet seviyeniz nedir?",
        required: true,
        options: ["Çok Memnun", "Memnun", "Kararsız", "Memnun Değil", "Hiç Memnun Değil"]
      },
      {
        id: 3,
        type: "multiple-choice",
        label: "Hangi hizmetlerimizi kullandınız?",
        required: true,
        options: ["Bireysel Danışmanlık", "Grup Terapisi", "Online Seanslar", "Workshoplar"]
      },
      {
        id: 4,
        type: "file-upload",
        label: "Varsa ek belge veya görüşlerinizi yükleyebilirsiniz",
        required: false,
        acceptedTypes: ["pdf", "doc", "docx", "jpg", "png"]
      }
    ]
  },
  {
    id: 3,
    title: "Ön Değerlendirme Formu",
    description: "İlk görüşme öncesi hazırlık amacıyla doldurulacak form.",
    status: "draft",
    participantCount: 0,
    createdAt: "2024-06-25",
    updatedAt: "2024-06-25",
    fields: [
      {
        id: 1,
        type: "text",
        label: "Ad Soyad",
        required: true,
        placeholder: "Tam adınızı giriniz"
      },
      {
        id: 2,
        type: "phone",
        label: "Telefon Numaranız",
        required: true,
        placeholder: "+90 555 123 45 67"
      },
      {
        id: 3,
        type: "email",
        label: "E-posta Adresiniz",
        required: true,
        placeholder: "email@example.com"
      },
      {
        id: 4,
        type: "single-choice",
        label: "Daha önce psikolojik destek aldınız mı?",
        required: true,
        options: ["Evet", "Hayır", "Kısmen"]
      }
    ]
  }
];

// Mock Form Responses Data
export const mockFormResponses = {
  1: [
    {
      id: 1,
      participantName: "Ayşe Demir",
      participantEmail: "ayse.demir@email.com",
      submittedAt: "2024-06-20T14:30:00",
      responses: {
        1: "Ayşe Demir",
        2: "ayse.demir@email.com",
        3: "26-35",
        4: ["İletişim", "Stres Yönetimi", "Öz Güven"],
        5: ["Mutluluk", "Aile", "Sağlık", "Kariyer", "Para"]
      }
    },
    {
      id: 2,
      participantName: "Mehmet Kaya",
      participantEmail: "mehmet.kaya@email.com",
      submittedAt: "2024-06-19T16:45:00",
      responses: {
        1: "Mehmet Kaya",
        2: "mehmet.kaya@email.com",
        3: "36-45",
        4: ["Liderlik", "Zaman Yönetimi"],
        5: ["Kariyer", "Para", "Sağlık", "Aile", "Mutluluk"]
      }
    },
    {
      id: 3,
      participantName: "Zeynep Yılmaz",
      participantEmail: "zeynep.yilmaz@email.com",
      submittedAt: "2024-06-18T11:20:00",
      responses: {
        1: "Zeynep Yılmaz",
        2: "zeynep.yilmaz@email.com",
        3: "18-25",
        4: ["Duygusal Zeka", "İletişim", "Öz Güven"],
        5: ["Aile", "Mutluluk", "Sağlık", "Kariyer", "Para"]
      }
    }
  ],
  2: [
    {
      id: 1,
      participantName: "Ali Özkan",
      participantEmail: "ali.ozkan@email.com",
      submittedAt: "2024-06-18T10:15:00",
      responses: {
        1: "Ali Özkan",
        2: "Çok Memnun",
        3: ["Bireysel Danışmanlık", "Online Seanslar"],
        4: null
      }
    },
    {
      id: 2,
      participantName: "Fatma Çelik",
      participantEmail: "fatma.celik@email.com",
      submittedAt: "2024-06-17T15:30:00",
      responses: {
        1: "",
        2: "Memnun",
        3: ["Grup Terapisi", "Workshoplar"],
        4: "feedback_document.pdf"
      }
    }
  ]
};
