
import { Product, FaqItem } from './types';

export const APP_NAME = "StyleSphere";
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '2319076',
    name: 'Charlene Dress Stone',
    description: 'Elegant stone-colored dress from Tuxer, perfect for any occasion.',
    price: 899,
    imageUrl: 'https://picsum.photos/seed/2319076/400/300',
    category: 'Apparel'
  },
  {
    id: '2319075',
    name: 'Charlene Dress Olivine',
    description: 'Stylish olivine green dress from Tuxer with modern design.',
    price: 899,
    imageUrl: 'https://picsum.photos/seed/2319075/400/300',
    category: 'Apparel'
  },
  {
    id: '2310841',
    name: 'Högalid Dress Grey Melange',
    description: 'Premium grey melange dress from Sätila of Sweden with sophisticated styling.',
    price: 1995,
    imageUrl: 'https://images.footway.com/02/61209-21_001.png',
    category: 'Apparel'
  },
  {
    id: '2301425',
    name: 'Högalid Dress Grey Melange',
    description: 'Classic grey melange dress from Sätila of Sweden, versatile and comfortable.',
    price: 1995,
    imageUrl: 'https://picsum.photos/seed/2301425/400/300',
    category: 'Apparel'
  },
  {
    id: '2301424',
    name: 'Högalid Dress Beige',
    description: 'Elegant beige dress from Sätila of Sweden with timeless appeal.',
    price: 1995,
    imageUrl: 'https://images.footway.com/02/61202-34_001.png',
    category: 'Apparel'
  },
  {
    id: '2193051',
    name: 'Club Dress Black',
    description: 'Athletic black dress from adidas Tennis, perfect for active wear.',
    price: 669,
    imageUrl: 'https://images.footway.com/02/61114-34_001.png',
    category: 'Apparel'
  },
  {
    id: '2182757',
    name: 'Dress Pink Lady',
    description: 'Vibrant pink dress from Champion, ideal for children\'s wear.',
    price: 350,
    imageUrl: 'https://images.footway.com/02/61106-03_001.png',
    category: 'Apparel'
  },
  {
    id: '2182439',
    name: 'Carmen Dress Dark Navy',
    description: 'Sophisticated dark navy dress from Tuxer with elegant design.',
    price: 499,
    imageUrl: 'https://images.footway.com/02/61105-79_001.png',
    category: 'Apparel'
  },
  {
    id: '2182438',
    name: 'Carmen Dress Navy Stripes',
    description: 'Stylish navy striped dress from Tuxer with classic nautical appeal.',
    price: 499,
    imageUrl: 'https://images.footway.com/02/61105-78_001.png',
    category: 'Apparel'
  },
  {
    id: '2177298',
    name: 'Essentials 3-Stripes Single Jersey Boyfriend Tee Dress Pink',
    description: 'Comfortable pink boyfriend tee dress from adidas with iconic 3-stripes design.',
    price: 469,
    imageUrl: 'https://images.footway.com/02/61103-46_001.png',
    category: 'Apparel'
  },
  {
    id: '2177149',
    name: 'Essentials 3-Stripes Single Jersey Boyfriend Tee Dress Medium Grey Heather / White',
    description: 'Relaxed grey heather and white boyfriend tee dress from adidas.',
    price: 469,
    imageUrl: 'https://images.footway.com/02/61101-97_001.png',
    category: 'Apparel'
  },
  {
    id: '2151753',
    name: 'W Pique Dress White',
    description: 'Premium white pique dress from Peak Performance with athletic styling.',
    price: 1199,
    imageUrl: 'https://images.footway.com/02/61081-66_001.png',
    category: 'Apparel'
  },
  {
    id: '2107501',
    name: 'Hmlfreja Gymsuit Rose Brown',
    description: 'Comfortable rose brown gymsuit from Hummel, perfect for active children.',
    price: 500,
    imageUrl: 'https://picsum.photos/seed/2107501/400/300',
    category: 'Apparel'
  },
  {
    id: '2107500',
    name: 'Hmlfreja Gymsuit Asphalt',
    description: 'Durable asphalt-colored gymsuit from Hummel for active kids.',
    price: 500,
    imageUrl: 'https://picsum.photos/seed/2107500/400/300',
    category: 'Apparel'
  }
];

export const SAMPLE_FAQS: FaqItem[] = [
  { id: 'faq1', question: 'What is your return policy?', answer: 'We offer a 30-day free return policy on all eligible items. Items must be in new and unused condition with original packaging.' },
  { id: 'faq2', question: 'How long does shipping take?', answer: 'Standard shipping typically takes 3-5 business days. Expedited options are available at checkout.' },
  { id: 'faq3', question: 'Do you ship internationally?', answer: 'Currently, we only ship within the United States. We are working on expanding our shipping options in the future.' },
  { id: 'faq4', question: 'How can I track my order?', answer: 'Once your order ships, you will receive an email with a tracking number and a link to track your package.' },
];

export const DEFAULT_GEMINI_ERROR_MESSAGE = "I'm sorry, I encountered an issue. Please try again or rephrase your request.";