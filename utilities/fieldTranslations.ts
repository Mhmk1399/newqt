// Field translation mapping for Persian labels
export const fieldTranslations: Record<string, string> = {
  // Common fields
  _id: "شناسه",
  name: "نام",
  code: "کد",
  phone: "شماره تماس",
  phoneNumber: "شماره تماس",
  createdAt: "تاریخ ثبت",
  updatedAt: "تاریخ بروزرسانی",
  date: "تاریخ",
  type: "نوع",
  count: "تعداد",
  price: "قیمت",
  description: "توضیحات",
  info: "اطلاعات",

  // Customer fields
  address: "آدرس",
  email: "ایمیل",
  enName: "نام لاتین",
  nationalId: "کد ملی",
  postalCode: "کد پستی",
  password: "رمز عبور",
  invoice: "فاکتور",
  detailedAcount: "حساب تفصیلی",

  // Customer Type fields
  percentage: "درصد",
  typePercentage: "درصد نوع",
  typeName: "نام نوع",

  // Customer Reports
  totalSales: "مجموع فروش",
  invoiceCount: "تعداد فاکتور",
  doubleGlassCount: "شیشه دوجداره",
  comboGlassCount: "شیشه کمبو",
  laminateGlassCount: "شیشه لمینت",

  // Glass fields
  thickness: "ضخامت",
  sellPrice: "قیمت فروش",
  width: "عرض",
  height: "ارتفاع",
  dimensions: "ابعاد",

  // Invoice fields
  customerId: "شناسه مشتری",
  customer: "مشتری",
  totalAmount: "مبلغ کل",
  status: "وضعیت",
  sideMaterial: "متتومان کناری",
  priority: "اولویت",
  productionDate: "تاریخ تولید",
  seller: "فروشنده",
  sellerId: "شناسه فروشنده",
  layers: "لایه‌ها",
  designNumber: "شماره طرح",
  confirmBy: "تایید شده توسط",
  editBy: "ویرایش شده توسط",
  productuModel: "مدل محصول",

  // Priority fields
  glasss: "شیشه",
  ServiceFee: "کارمزد سرویس",
  serviceFeeType: "نوع کارمزد",
  serviceFeeValue: "مقدار کارمزد",

  // User fields
  username: "نام کاربری",
  role: "نقش",

  // Inventory fields
  buyPrice: "قیمت خرید",
  provider: "تامین کننده",
  providerName: "نام تامین کننده",
  glass: "شیشه",
  glassId: "شناسه شیشه",
  materialType: "نوع متتومان",
  materialName: "نام متتومان",
  enterDate: "تاریخ ورود",
  totalArea: "مساحت کل",
  usedAmount: "مقدار استفاده شده",
  usedArea: "مساحت استفاده شده",
  originalData: "نام",
  customerName: "نام مشتری",
  customerCode: "کد مشتری",
  customerPhone: "تلفن مشتری",
  customerAddress: "آدرس مشتری",
  priceValue: "مقدار قیمت",
  priorityName: "نام اولویت",
  priorityDays: "روزهای اولویت",
  priorityServiceFee: "کارمزد اولویت",
  layersCount: "تعداد لایه‌ها",
  layersDetails: "جزئیات لایه‌ها",
  sideMaterialsDetails: "جزئیات متتومان‌های کناری",
  // Treatment fields
  treatment: "پردازش",
  treatments: "پردازش‌ها",
  usageCount: "تعداد استفاده",
  measurement: "اندازه‌گیری",

  // Product fields
  sideMaterials: "متتومان‌های کناری",
  productLine: "خط تولید",
  productType: "نوع محصول",
  productTypeDisplay: "نمایش نوع محصول",
  sideMaterialsDisplay: "نمایش مواد جانبی",
  productLineDisplay: "نمایش خط محصول",
  layersDisplay: "نمایش لایه ها",

  // Allocation fields
  customerTypeId: "شناسه نوع مشتری",
  priorityId: "شناسه اولویت",

  // Non-standard dimensions
  minCount: "حداقل تعداد",
  maxCount: "حداکثر تعداد",
  min: "حداقل",
  max: "حداکثر",

  // Reports
  purchaseAmount: "مبلغ خرید",
  purchasedArea: "مساحت خریداری شده",
  consumedArea: "مساحت مصرف شده",
  purchasedQuantity: "مقدار خریداری شده",
  consumedQuantity: "مقدار مصرف شده",
  purchaseDate: "تاریخ خرید",
  glassCounts: "تعداد شیشه",
  lastInvoiceDate: "آخرین فاکتور",

  // Additional fields
  url: "آدرس",
  title: "عنوان",
  line: "خط",
  value: "مقدار",
  areaRow: "مساحت ردیف",
  basicPrice: "قیمت پایه",
  originalPrice: "قیمت اصلی",
  totalPrice: "قیمت کل",
  pricePerSqMeter: "قیمت هر متر مربع",
  isNegotiatedPrice: "قیمت مذاکره شده",
};

export const translateField = (key: string): string => {
  return fieldTranslations[key] || key;
};
