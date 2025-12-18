// Planes y características del sistema

export type PlanType = 'free' | 'premium';
export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  limitations?: string[];
}

export interface Subscription {
  plan: PlanType;
  billingCycle?: BillingCycle;
  status: 'active' | 'pending' | 'expired' | 'none';
  startDate?: string;
  endDate?: string;
  paymentReference?: string;
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Gratis',
    description: 'Perfecto para empezar',
    price: {
      monthly: 0,
      annual: 0,
    },
    features: [
      'Perfil digital básico',
      'Hasta 3 enlaces sociales',
      'Código QR básico',
      'Compartir perfil',
    ],
    limitations: [
      'Sin estadísticas avanzadas',
      'Sin personalización de colores',
      'Sin temas premium',
      'Marca de agua Pulpy',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Todas las funcionalidades',
    price: {
      monthly: 500, // 500 CUP mensual
      annual: 4800, // 4800 CUP anual (ahorro de 2 meses)
    },
    features: [
      'Perfil digital completo',
      'Enlaces sociales ilimitados',
      'Código QR personalizado',
      'Estadísticas avanzadas',
      'Personalización completa de colores',
      'Todos los temas disponibles',
      'Sin marca de agua',
      'Soporte prioritario',
      'Dominio personalizado (próximamente)',
    ],
  },
};

// Número de WhatsApp de soporte (Cuba)
export const SUPPORT_WHATSAPP = '+5352123456'; // Cambiar por el número real

// Generar referencia de pago única
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PLP-${timestamp}-${random}`;
}

// Generar mensaje de WhatsApp prellenado
export function generateWhatsAppMessage(
  reference: string,
  planName: string,
  billingCycle: BillingCycle,
  amount: number,
  userName: string
): string {
  const cycleText = billingCycle === 'monthly' ? 'Mensual' : 'Anual';
  
  return encodeURIComponent(
`🍊 *SOLICITUD DE PAGO PULPY*

📋 *Referencia:* ${reference}
👤 *Usuario:* ${userName}
📦 *Plan:* ${planName} (${cycleText})
💰 *Monto:* ${amount.toLocaleString('es-CU')} CUP

Por favor, confirmen cuando el pago sea procesado.

¡Gracias! 🙏`
  );
}

// Generar URL de WhatsApp
export function getWhatsAppUrl(
  reference: string,
  planName: string,
  billingCycle: BillingCycle,
  amount: number,
  userName: string
): string {
  const message = generateWhatsAppMessage(reference, planName, billingCycle, amount, userName);
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`;
}

// Verificar si una feature requiere premium
export const PREMIUM_FEATURES = {
  unlimitedLinks: true,
  customQr: true,
  advancedStats: true,
  customColors: true,
  premiumThemes: true,
  noWatermark: true,
  prioritySupport: true,
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;

export function requiresPremium(feature: PremiumFeature): boolean {
  return PREMIUM_FEATURES[feature];
}

