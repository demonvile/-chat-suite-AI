// Payment Gateway Abstraction & Extensible Provider Registry
// Supports Stripe, PayPal, and future gateways (Adyen, Razorpay, Paddle, etc.)

export interface PaymentProviderConfig {
  id: 'stripe' | 'paypal' | string;
  name: string;
  logo: string;
  supportedCurrencies: string[];
  supportsCards: boolean;
  supportsExpressCheckout: boolean;
  enabled: boolean;
}

export interface PaymentProcessRequest {
  provider: 'stripe' | 'paypal' | string;
  amount: number;
  currency: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  cardNumber?: string;
  expMonth?: number;
  expYear?: number;
  cvc?: string;
  cardHolderName?: string;
  paypalEmail?: string;
}

export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  provider: string;
  brand?: string;
  last4?: string;
  message: string;
  receiptUrl?: string;
}

class PaymentGatewayRegistry {
  private providers: Map<string, PaymentProviderConfig> = new Map();

  constructor() {
    // Register Default Stripe Provider
    this.registerProvider({
      id: 'stripe',
      name: 'Stripe Payments',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      supportsCards: true,
      supportsExpressCheckout: true,
      enabled: true
    });

    // Register Default PayPal Provider
    this.registerProvider({
      id: 'paypal',
      name: 'PayPal Express Checkout',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=120&q=80',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      supportsCards: true,
      supportsExpressCheckout: true,
      enabled: true
    });
  }

  public registerProvider(config: PaymentProviderConfig) {
    this.providers.set(config.id, config);
  }

  public getAvailableProviders(): PaymentProviderConfig[] {
    return Array.from(this.providers.values()).filter(p => p.enabled);
  }

  public detectCardBrand(cardNumber: string): string {
    const clean = cardNumber.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|27[0-1]|2720)/.test(clean)) return 'MasterCard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Credit Card';
  }

  public validateCardNumber(cardNumber: string): boolean {
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }
}

export const paymentGateways = new PaymentGatewayRegistry();
