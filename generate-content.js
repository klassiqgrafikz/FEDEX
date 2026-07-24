const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'pages-manifest.json'), 'utf-8'));
const CONTENT_DIR = path.join(__dirname, 'pages', 'content');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

function icon(name) {
  const icons = {
    ship: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M32 9.5c0-.1 0-.2-.1-.4V9c0-.1-.1-.2-.2-.2l-.1-.1c-.1-.1-.2-.1-.3-.2L16.3 2c-.3-.1-.5-.1-.8 0L.5 8.5c-.1 0-.2.1-.3.2 0 0 0 .1-.1.1.1.1 0 .2 0 .3v.1c-.1.1-.1.2-.1.3v14c0 .4.2.8.6.9l15 6c.1 0 .2.1.4.1.1 0 .3 0 .4-.1l15-6.1c.4-.2.6-.5.6-.9V9.5z"/></svg>',
    track: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M31.7 30.3l-5.1-5.1C27.5 24 28 22.6 28 21c0-3.9-3.1-7-7-7s-7 3.1-7 7 3.1 7 7 7c1.6 0 3-.5 4.2-1.4l5.1 5.1c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4zM21 26c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/></svg>',
    globe: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 2c3.1 0 5.9 1.1 8.2 3H7.8C10.1 3.1 12.9 2 16 2zM6 7h3.5c-.9 1.9-1.5 3.9-1.8 6H2.1c.6-2.4 2-4.5 3.9-6zm3.8-2h12.4c1.3 1.3 2.2 2.9 2.8 4.6H7c.6-1.7 1.5-3.3 2.8-4.6zM2 16c0-.7.1-1.4.2-2h6c-.2 2.1-.2 4.2 0 6h-6c-.1-1.3-.2-2.6-.2-4zm8.3-2h11.4c.2 2.1.2 4.2 0 6H10.3c-.2-1.9-.2-3.9 0-6zm0 8h11.4c-.7 2.8-2.1 5.2-4 6.9-1.1.7-2.4 1.1-3.7 1.1s-2.6-.4-3.7-1.1c-1.9-1.7-3.3-4.1-4-6.9zm22-2h-6c.2-1.9.2-3.9 0-6h6c.1 1.3.2 2.6.2 4s-.1 2.7-.2 4zm-6-8h5.9c1.9 1.5 3.3 3.6 3.9 6h-5.8c-.2-2.1-.9-4.1-1.8-6h-2.2zM7 20H2.1c.6 2.4 2 4.5 3.9 6H9.5c-.9-1.9-1.5-3.9-1.8-6H7zm18 0h1.5c-.3 2.1-.9 4.1-1.8 6H26c1.9-1.5 3.3-3.6 3.9-6H25zm-3 8H9.8C12.1 28.9 14 30 16 30s3.9-1.1 6-2z"/></svg>',
    box: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M27 0H11c-.3 0-.5.1-.7.3l-6 6c-.2.2-.3.4-.3.7v24c0 .6.4 1 1 1h22c.6 0 1-.4 1-1V1c0-.6-.4-1-1-1zM11 2.4V7H6.4L11 2.4zM26 30H6V9h6c.6 0 1-.4 1-1V2h13v28z"/></svg>',
    support: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 30C8.3 30 2 23.7 2 16S8.3 2 16 2s14 6.3 14 14-6.3 14-14 14z"/><path d="M15 21h2v2h-2zM16 8.5c-4 0-4 3.5-4 3.5h2c0-.5.2-1 .6-1.4.4-.4.9-.6 1.4-.6s1.1.2 1.4.6c.4.4.6.9.6 1.4 0 .6-.1 1.2-.4 1.7-.4.6-.8 1.1-1.3 1.7-.5.4-.9.8-1.2 1.4-.1.7-.2 1.4-.1 2.2h2c0-2.2-.1-2.1.4-2.6.6-.6 1.2-1.3 1.7-2s.8-1.6.9-2.4c0-3-2.7-3.5-4-3.5z"/></svg>',
    document: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M27 0H11c-.3 0-.5.1-.7.3l-6 6c-.2.2-.3.4-.3.7v24c0 .6.4 1 1 1h22c.6 0 1-.4 1-1V1c0-.6-.4-1-1-1zM11 2.4V7H6.4L11 2.4zM26 30H6V9h6c.6 0 1-.4 1-1V2h13v28z"/><path d="M9 12h14v2H9zM9 17h14v2H9zM9 22h10v2H9z"/></svg>',
    money: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 30C8.3 30 2 23.7 2 16S8.3 2 16 2s14 6.3 14 14-6.3 14-14 14z"/><path d="M18 13.5c0 .6.4 1 1 1s1-.4 1-1c0-1.8-1.3-3.2-3-3.4V8c0-.6-.4-1-1-1s-1 .4-1 1v2.1c-1.7.2-3 1.7-3 3.4s1.3 3.2 3 3.4v3c-.6-.2-1-.8-1-1.4s-.4-1-1-1-1 .4-1 1c0 1.8 1.3 3.2 3 3.4V24c0 .6.4 1 1 1s1-.4 1-1v-2.1c1.7-.2 3-1.7 3-3.4s-1.3-3.2-3-3.4v-3c.6.2 1 .7 1 1.4z"/></svg>',
    location: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C9.4 0 4 5.4 4 12c0 8 12 20 12 20s12-12 12-20C28 5.4 22.6 0 16 0zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>',
    phone: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M22 0H10C8.3 0 7 1.3 7 3v26c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zm1 28H9V4h14v24z"/><circle cx="16" cy="26" r="1.5"/></svg>',
    calendar: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M28 4h-3V2h-2v2H9V2H7v2H4C2.9 4 2 4.9 2 6v24c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 26H4V12h24v18zm0-20H4V6h3v2h2V6h14v2h2V6h3v4z"/></svg>',
    shield: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0L2 6v9c0 6.8 4.6 13.2 11 15 6.4-1.8 11-8.2 11-15V6L16 0zm9 15c0 5.8-3.9 11.3-9 12.9V3.1l9 4.5v7.4z"/></svg>',
    check: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 30C8.3 30 2 23.7 2 16S8.3 2 16 2s14 6.3 14 14-6.3 14-14 14z"/><path d="M13.3 22.3c-.4 0-.8-.1-1.1-.4l-4.7-4.7c-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0l3.7 3.7 8.2-8.2c.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1L14.4 21.9c-.3.3-.7.4-1.1.4z"/></svg>',
    people: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 30c-3.1 0-6-1-8.4-2.5 1.1-1.9 3.1-3.1 5.4-3.1h6c2.3 0 4.3 1.3 5.4 3.1-2.4 1.6-5.3 2.5-8.4 2.5zm5-18c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z"/></svg>',
    clock: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 30C8.3 30 2 23.7 2 16S8.3 2 16 2s14 6.3 14 14-6.3 14-14 14z"/><path d="M21 15h-4V8c0-.6-.4-1-1-1s-1 .4-1 1v8c0 .6.4 1 1 1h5c.6 0 1-.4 1-1s-.4-1-1-1z"/></svg>',
    returns: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M17 8h-2c-1.4 0-4 1-4 5v5.6l-1.3-1.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l3 3c.2.2.5.3.7.3s.5-.1.7-.3l3-3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L13 18.6V13c0-2.8 1.7-3 2-3h2c.1 0 2 0 2 3v9c0 .6.4 1 1 1s1-.4 1-1v-9c0-4-2.6-5-4-5z"/><path d="M30.7 13.3l-12-12C18 .6 17.1.1 16.1 0h-.2c-1 .1-1.9.6-2.6 1.3l-12 12C.6 14 .1 14.9 0 15.9v.2c.1 1 .6 1.9 1.3 2.6l12 12c.7.7 1.6 1.2 2.6 1.3h.2c1-.1 1.9-.6 2.6-1.3l12-12c.7-.7 1.2-1.6 1.3-2.6v-.3c-.1-.9-.6-1.8-1.3-2.5z"/></svg>',
    star: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M32 12.3l-9.9-1.4L16 .5l-6.1 10.4L0 12.3l7.8 7-1.8 10.2L16 24.5l9.9 5-1.8-10.2 7.9-7z"/></svg>',
    print: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M27 10h-2V2H7v8H5c-2.8 0-5 2.2-5 5v7c0 2.8 2.2 5 5 5h2v3h20v-3h2c2.8 0 5-2.2 5-5v-7c0-2.8-2.2-5-5-5zM9 4h14v6H9V4zm14 26H9V18h14v12zm7-8c0 1.7-1.3 3-3 3h-2v-5H7v5H5c-1.7 0-3-1.3-3-3v-7c0-1.7 1.3-3 3-3h24c1.7 0 3 1.3 3 3v7z"/></svg>',
    alert: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M14.9 22.6h2v2h-2z"/><path d="M14.9 17l.8 4.9h.5l.7-4.9v-3.4h-2z"/><path d="M31.8 27.4L17.6 3c-.3-.6-.9-1-1.6-1h-.3c-.6.1-1.1.5-1.4 1.1L.2 27.4c-.2.3-.3.6-.3.9 0 .9.7 1.7 1.6 1.7h28.8c.5 0 1-.3 1.5-.8.3-.5.3-1.2 0-1.8z"/></svg>',
    refresh: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M2.5 12.4C4.4 5 12.2.5 19.7 2.5c2.8.8 5.3 2.4 7.1 4.5H23v2h6c.6 0 1-.4 1-1V2h-2v3.4c-2.1-2.3-4.8-4-7.8-4.9C11.6-1.7 2.8 3.4.5 11.9.2 13.4 0 14.8 0 16h2c0-1.1.2-2.3.5-3.6z"/><path d="M30 16c0 1.1-.1 2.1-.5 3.5-.9 3.6-3.3 6.6-6.5 8.5-3.3 1.9-7 2.4-10.7 1.4-2.8-.8-5.2-2.3-7-4.4H9v-2H3.9s0-.1-.1-.1l-.1.1H3c-.6 0-1 .4-1 1v6h2v-3.5c2.1 2.3 4.8 4 7.8 4.9 1.4.4 2.8.5 4.1.5 2.8 0 5.5-.7 8-2.1 3.7-2.1 6.4-5.6 7.5-9.7.4-1.6.5-2.8.5-4H30z"/></svg>',
    pickup: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M31.8 25.4c-.3-.5-.9-.6-1.4-.3l-3.7 2.5-7.3-9.8c.9-.3 1.6-1.2 1.6-2.3 0-.7-.3-1.3-.9-1.8l-2.4-1.9-1.4-2.3C16 8.9 15 8 14 8h-2c-1.3 0-2.5 1.1-2.5 2.4L7 18.5c0 .7.3 1.4.9 2.2l-2.1 2.5L1 26.5c-.6.5-1 1.3-1 2.1C0 29.9 1.1 31 2.4 31c.4 0 .8-.1 1.2-.3l5.9-2.8c.2-.1.5-.4.7-.6l.1-.1 1.4-1.7.5.6 1.8 5.3v.1c.3 1 1.3 1.6 2.3 1.6 1.3 0 2.4-1.1 2.4-2.4 0-.2 0-.4-.1-.6l-1.7-6.3-1.9-5.5v-.1c.2.1.4.1.7.1.5 0 .9-.1 1.3-.4l6.2 8.3c-1.7.2-3 1.6-3 3.4 0 1.9 1.5 3.4 3.4 3.4 1.8 0 3.2-1.4 3.4-3.1l4.5-3c.4-.3.5-.9.2-1.4z"/></svg>',
    freight: '<svg viewBox="0 0 32 32" width="32" height="32" fill="#660099"><path d="M30 0H2C.9 0 0 .9 0 2v28c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 30H2V2h28v28z"/><path d="M8 10h6v2H8zM8 14h4v2H8zM18 10h6v6h-6z"/></svg>'
  };
  return icons[name] || icons.ship;
}

function pageContent(id, title) {
  const profiles = {
    'shipping': { sub: 'Explore all FedEx shipping solutions for your business and personal needs.', ov: 'FedEx offers a comprehensive range of shipping services designed to meet the needs of businesses of all sizes. From express overnight delivery to economical ground shipping, our portfolio ensures your packages arrive on time and within budget.', feats: [
      { icon: 'ship', title: 'Express Shipping', text: 'Time-definite delivery options for urgent shipments, including overnight and same-day services across the globe.' },
      { icon: 'globe', title: 'International Shipping', text: 'Expand your reach with our global shipping network covering more than 220 countries and territories worldwide.' },
      { icon: 'money', title: 'Competitive Rates', text: 'Save on every shipment with volume discounts, flat-rate options, and our Rewards program for frequent shippers.' }
    ]},
    'create-shipment': { sub: 'Prepare and send your packages quickly with FedEx online tools.', ov: 'Creating a shipment with FedEx is fast and straightforward. Our online platform guides you through every step, from entering package details to printing labels and scheduling a pickup.', feats: [
      { icon: 'box', title: 'Label Printing', text: 'Generate and print shipping labels instantly from any device. Supports thermal printers and standard paper formats.' },
      { icon: 'pickup', title: 'Schedule Pickup', text: 'Arrange for a driver to collect your packages from your home or office at a time that works for you.' },
      { icon: 'check', title: 'Address Validation', text: 'Our system automatically verifies addresses to prevent delivery delays and ensure accurate routing.' }
    ]},
    'rates': { sub: 'Compare shipping rates and find the best option for your delivery needs.', ov: 'Get instant rate quotes for any FedEx service. Enter your shipment details and compare pricing across our full range of domestic and international shipping options.', feats: [
      { icon: 'money', title: 'Rate Comparison', text: 'View pricing across FedEx Express, Ground, Freight, and International services side by side.' },
      { icon: 'calendar', title: 'Transit Times', text: 'See estimated delivery dates for each service option to choose the right balance of speed and cost.' },
      { icon: 'ship', title: 'Special Services', text: 'Add signature requirements, insurance, and other value-added services with transparent pricing.' }
    ]},
    'schedule-pickup': { sub: 'Arrange a FedEx pickup at your location on your schedule.', ov: 'Scheduling a FedEx pickup is easy and flexible. Whether you need a one-time pickup or regular daily service, we can accommodate your schedule and ensure your packages are collected promptly.', feats: [
      { icon: 'calendar', title: 'One-Time Pickup', text: 'Schedule a single pickup for today or a future date. Choose your preferred time window.' },
      { icon: 'refresh', title: 'Recurring Pickup', text: 'Set up daily or weekly regular pickups for consistent shipping needs. Modify or cancel anytime.' },
      { icon: 'clock', title: 'On-Demand Pickup', text: 'Request a pickup within hours for urgent shipments. Our driver network responds quickly.' }
    ]},
    'packing': { sub: 'Find the right packing supplies and guidance for safe shipping.', ov: 'Proper packing is essential for protecting your shipments. FedEx provides expert guidance and quality supplies to ensure your items arrive safely at their destination.', feats: [
      { icon: 'box', title: 'Free Packaging', text: 'FedEx Express and Ground boxes, envelopes, and tubes are available free of charge at FedEx locations.' },
      { icon: 'document', title: 'Packing Guidelines', text: 'Follow our step-by-step guides for packing fragile items, hazardous materials, and international shipments.' },
      { icon: 'check', title: 'Packing Services', text: 'Visit a FedEx Office location for professional packing assistance and custom crating solutions.' }
    ]},
    'international': { sub: 'Navigate global shipping with FedEx international expertise.', ov: 'Shipping internationally requires careful attention to customs regulations, documentation, and transit times. FedEx makes it simple with dedicated support and streamlined processes.', feats: [
      { icon: 'globe', title: 'Customs Clearance', text: 'Our experienced customs brokerage team helps ensure smooth clearance across borders worldwide.' },
      { icon: 'document', title: 'Documentation', text: 'Generate commercial invoices, certificates of origin, and other required customs documents easily.' },
      { icon: 'clock', title: 'Transit Times', text: 'Choose from multiple time-definite international delivery options to major markets around the world.' }
    ]},
    'freight': { sub: 'Heavy freight and LTL shipping solutions for large shipments.', ov: 'FedEx Freight offers reliable less-than-truckload (LTL) shipping with fast transit times and online tracking. From pallets to partial truckloads, we handle freight of all sizes.', feats: [
      { icon: 'freight', title: 'LTL Shipping', text: 'Cost-effective less-than-truckload service with fast transit times and detailed online tracking.' },
      { icon: 'pickup', title: 'Freight Pickup', text: 'Schedule freight pickups online with flexible time windows and real-time status updates.' },
      { icon: 'money', title: 'Volume Discounts', text: 'Save on freight shipping with tiered pricing based on volume and frequency of shipments.' }
    ]},
    'returns': { sub: 'Simplify returns management with FedEx return solutions.', ov: 'Managing returns efficiently is critical for customer satisfaction. FedEx provides comprehensive return solutions that make the process seamless for both businesses and their customers.', feats: [
      { icon: 'returns', title: 'Return Labels', text: 'Generate prepaid return labels and include them in outbound shipments for easy customer returns.' },
      { icon: 'check', title: 'Tracking', text: 'Monitor return shipments in real time and receive notifications when items are on their way back.' },
      { icon: 'location', title: 'Drop-Off Options', text: 'Customers can drop return packages at thousands of FedEx locations nationwide with extended hours.' }
    ]},
    'advanced-tracking': { sub: 'Comprehensive tracking tools for all your FedEx shipments.', ov: 'FedEx Advanced Shipment Tracking provides detailed visibility into your packages from pickup to delivery. Get real-time updates, proof of delivery, and proactive notifications.', feats: [
      { icon: 'track', title: 'Real-Time Tracking', text: 'Monitor your shipments with up-to-the-minute status updates and detailed scan history.' },
      { icon: 'alert', title: 'Delivery Alerts', text: 'Receive email or text notifications for key events including departure, arrival, and delivery.' },
      { icon: 'document', title: 'Proof of Delivery', text: 'Access delivery signatures, photos, and timestamp records for complete shipment verification.' }
    ]},
    'manage-delivery': { sub: 'Customize your delivery preferences and manage shipments.', ov: 'FedEx Delivery Manager gives you control over your incoming packages. Choose delivery options that fit your schedule and preferences, all from one convenient dashboard.', feats: [
      { icon: 'calendar', title: 'Delivery Options', text: 'Redirect to a nearby FedEx location, schedule a specific delivery time, or request weekend delivery.' },
      { icon: 'location', title: 'Hold at Location', text: 'Redirect packages to a FedEx retail location for secure pickup at your convenience.' },
      { icon: 'alert', title: 'Notifications', text: 'Get customized alerts about your package status via email, text message, or the FedEx mobile app.' }
    ]},
    'tracking': { sub: 'Track all your FedEx shipments from one central location.', ov: 'Our comprehensive tracking services provide end-to-end visibility for every FedEx shipment. Enter your tracking number or manage multiple shipments through your account.', feats: [
      { icon: 'track', title: 'Multi-Shipment View', text: 'Track multiple packages simultaneously with a consolidated view of all your shipments.' },
      { icon: 'phone', title: 'Mobile Tracking', text: 'Track packages on the go with the FedEx Mobile app, available for iOS and Android devices.' },
      { icon: 'clock', title: 'History & Reports', text: 'Access your shipment history and generate detailed delivery reports for record-keeping.' }
    ]},
    'office': { sub: 'Print, ship, and more at FedEx Office locations near you.', ov: 'FedEx Office provides professional printing, shipping, and business services at convenient locations nationwide. From business cards to banners, we bring your projects to life.', feats: [
      { icon: 'print', title: 'Professional Printing', text: 'High-quality printing for business cards, flyers, brochures, posters, banners, and more.' },
      { icon: 'document', title: 'Document Services', text: 'Scanning, copying, faxing, and binding services to keep your business running smoothly.' },
      { icon: 'ship', title: 'Pack & Ship', text: 'Expert packing and shipping services with a full range of packaging supplies available on site.' }
    ]},
    'office-print': { sub: 'Explore printing, products, and design services at FedEx Office.', ov: 'FedEx Office offers a complete range of print products and design services to help your business communicate effectively. From marketing materials to signage, we deliver professional results.', feats: [
      { icon: 'print', title: 'Business Cards', text: 'Professional business cards with multiple paper stocks, finishes, and quantity options.' },
      { icon: 'document', title: 'Document Printing', text: 'Black-and-white and color printing for presentations, reports, proposals, and training materials.' },
      { icon: 'star', title: 'Design Services', text: 'Work with our design team to create custom layouts for your marketing and business materials.' }
    ]},
    'office-services': { sub: 'Browse all services available at FedEx Office locations.', ov: 'FedEx Office provides a wide array of business services beyond printing and shipping. From notary services to computer rentals, we support your business needs.', feats: [
      { icon: 'document', title: 'Notary Services', text: 'Certified notaries available at participating locations for document signing and legal forms.' },
      { icon: 'check', title: 'Mailbox Services', text: 'A professional mailing address with package receiving, forwarding, and notification services.' },
      { icon: 'print', title: 'Large Format Printing', text: 'Posters, banners, signs, and trade show displays printed on premium materials with fast turnaround.' }
    ]},
    'drop-off': { sub: 'Find convenient ways to drop off your FedEx packages.', ov: 'Dropping off a FedEx package is easy with thousands of convenient locations nationwide. No box or label needed at many locations — we can help you prepare your shipment on site.', feats: [
      { icon: 'location', title: 'Drop Boxes', text: 'FedEx drop boxes are located in thousands of convenient locations for quick package drop-off.' },
      { icon: 'ship', title: 'Staffed Locations', text: 'FedEx Office and staffed shipping centers provide full-service drop-off with packing assistance.' },
      { icon: 'clock', title: 'Extended Hours', text: 'Many locations offer evening and weekend hours for maximum flexibility and convenience.' }
    ]},
    'hold-at-location': { sub: 'Have your packages held for pickup at a nearby FedEx location.', ov: 'FedEx Hold at Location lets you redirect packages to a convenient FedEx location for secure pickup. Perfect for when you cannot be home to receive a delivery.', feats: [
      { icon: 'location', title: 'Secure Pickup', text: 'Packages are held securely at the location until you arrive. Government-issued ID required for pickup.' },
      { icon: 'calendar', title: 'Extended Hold', text: 'Packages can be held for up to 7 business days, giving you plenty of time to retrieve them.' },
      { icon: 'check', title: 'No Charge', text: 'Hold at Location is a free service included with your FedEx shipment at no additional cost.' }
    ]},
    'locations': { sub: 'Find FedEx locations near you including drop boxes and staffed centers.', ov: 'With thousands of locations nationwide, FedEx makes it easy to find a convenient drop-off, pickup, or shipping center near you. Search by city, state, or ZIP code.', feats: [
      { icon: 'location', title: 'Nearby Search', text: 'Find FedEx locations closest to your current location with hours, services, and directions.' },
      { icon: 'clock', title: 'Hours & Services', text: 'View operating hours and available services for each location, including printing and packing.' },
      { icon: 'ship', title: 'Full Service Centers', text: 'Staffed locations offer packing, printing, and expert shipping advice in addition to drop-off services.' }
    ]},
    'small-business': { sub: 'Resources and tools to help your small business grow with FedEx.', ov: 'FedEx Small Business Center provides the tools, insights, and shipping solutions that small businesses need to compete and grow in today\'s marketplace.', feats: [
      { icon: 'star', title: 'Business Tools', text: 'Access shipping software, address management, and reporting tools designed for small businesses.' },
      { icon: 'money', title: 'Savings Program', text: 'Exclusive discounts and rewards for small business shippers, including volume-based pricing.' },
      { icon: 'people', title: 'Community', text: 'Join a community of small business owners sharing tips, success stories, and best practices.' }
    ]},
    'service-guide': { sub: 'Detailed service information, rates, and terms for FedEx services.', ov: 'The FedEx Service Guide provides comprehensive information about our shipping services, rates, terms, and conditions. Use this resource to understand all available options.', feats: [
      { icon: 'document', title: 'Service Details', text: 'Complete information about transit times, delivery areas, packaging requirements, and service commitments.' },
      { icon: 'money', title: 'Rate Tables', text: 'Detailed rate tables for all FedEx services, including surcharges, discounts, and special handling fees.' },
      { icon: 'shield', title: 'Terms & Conditions', text: 'Official terms of service, liability limits, claims procedures, and money-back guarantee details.' }
    ]},
    'manage-account': { sub: 'Manage your FedEx account settings, billing, and preferences.', ov: 'Your FedEx account dashboard provides centralized control over your shipping profile, billing information, and service preferences. Manage everything from one secure location.', feats: [
      { icon: 'shield', title: 'Account Security', text: 'Manage login credentials, two-factor authentication, and authorized users for your account.' },
      { icon: 'document', title: 'Billing & Invoices', text: 'View invoices, payment history, and set up automatic payments or paperless billing options.' },
      { icon: 'check', title: 'Shipping Preferences', text: 'Set default shipping options, save address books, and customize your shipping experience.' }
    ]},
    'faq': { sub: 'Find answers to frequently asked questions about FedEx services.', ov: 'Our comprehensive FAQ section covers the most common questions about shipping, tracking, billing, and more. Search by topic or browse categories to find the information you need.', feats: [
      { icon: 'support', title: 'Shipping Questions', text: 'Answers about packaging, shipping restrictions, delivery times, and international shipping requirements.' },
      { icon: 'track', title: 'Tracking Help', text: 'Learn how to track packages, interpret status updates, and resolve delivery issues.' },
      { icon: 'money', title: 'Billing Support', text: 'Information about invoices, payment methods, rate changes, and fee explanations.' }
    ]},
    'claims': { sub: 'File or manage a claim for damaged, lost, or delayed shipments.', ov: 'FedEx makes it easy to file a claim when your shipment experiences damage, loss, or delay. Our streamlined process ensures your claim is handled promptly and fairly.', feats: [
      { icon: 'document', title: 'File a Claim', text: 'Submit your claim online with supporting documentation for fast processing and resolution.' },
      { icon: 'clock', title: 'Claim Status', text: 'Track the progress of your claim from submission through review and resolution.' },
      { icon: 'check', title: 'Claim Guidelines', text: 'Review eligibility requirements, documentation needs, and processing timelines before filing.' }
    ]},
    'billing': { sub: 'Manage your FedEx billing, invoices, and payment options.', ov: 'FedEx Billing & Invoicing provides flexible payment solutions and detailed invoice management. View, pay, and manage your shipping charges with convenient online tools.', feats: [
      { icon: 'money', title: 'Invoice Management', text: 'View detailed invoices, download statements, and manage billing history for all your accounts.' },
      { icon: 'calendar', title: 'Payment Plans', text: 'Set up automatic payments, schedule future payments, or choose net terms that work for your business.' },
      { icon: 'document', title: 'Paperless Billing', text: 'Reduce paper waste with electronic invoices and statements delivered directly to your inbox.' }
    ]},
    'customer-support': { sub: 'Get help from FedEx customer support for all your shipping needs.', ov: 'Our customer support team is here to help with questions about shipping, tracking, billing, and more. Multiple contact options are available to provide the assistance you need.', feats: [
      { icon: 'phone', title: 'Phone Support', text: 'Speak with a customer service representative for personalized assistance with complex issues.' },
      { icon: 'support', title: 'Online Help Center', text: 'Search our knowledge base for instant answers to common questions and step-by-step guides.' },
      { icon: 'people', title: 'Live Chat', text: 'Chat online with a support specialist for quick answers without waiting on hold.' }
    ]},
    'email-alerts': { sub: 'Stay informed with email alerts about your FedEx shipments.', ov: 'FedEx email alerts keep you updated on your shipments at every stage of the delivery process. Receive notifications for key events automatically delivered to your inbox.', feats: [
      { icon: 'alert', title: 'Shipment Events', text: 'Receive alerts for pickup confirmation, departure, arrival, out-for-delivery, and delivery completion.' },
      { icon: 'calendar', title: 'Delivery Window', text: 'Get notified of your estimated delivery window and any changes to the scheduled delivery time.' },
      { icon: 'check', title: 'Customizable', text: 'Choose which alerts you receive and how frequently. Manage preferences for each shipment individually.' }
    ]},
    'delivery-support': { sub: 'Get the support you need for your FedEx deliveries.', ov: 'FedEx Delivery Support provides assistance with delivery-related questions and concerns. Whether you need to redirect a package or resolve a delivery issue, we are here to help.', feats: [
      { icon: 'location', title: 'Delivery Options', text: 'Modify delivery preferences, redirect packages, or request a hold at a nearby FedEx location.' },
      { icon: 'track', title: 'Delivery Status', text: 'Get detailed information about your delivery status and estimated arrival time.' },
      { icon: 'support', title: 'Issue Resolution', text: 'Report delivery problems and work with our support team to find a satisfactory resolution.' }
    ]},
    'open-account': { sub: 'Open a FedEx account and start shipping with great rates.', ov: 'Opening a FedEx account gives you access to exclusive shipping rates, powerful management tools, and rewards. Get started today and save on every shipment.', feats: [
      { icon: 'money', title: 'Exclusive Rates', text: 'Enjoy special account holder pricing with discounts on FedEx Express, Ground, and Freight services.' },
      { icon: 'star', title: 'FedEx Rewards', text: 'Earn points on every shipment that can be redeemed for gift cards, merchandise, and shipping discounts.' },
      { icon: 'check', title: 'Quick Setup', text: 'Create your account online in minutes with instant access to shipping tools and features.' }
    ]},
    'one-rate': { sub: 'Simplify pricing with FedEx One Rate flat-rate shipping.', ov: 'FedEx One Rate simplifies shipping with predictable flat-rate pricing. Pack as much as you can fit into the box for one low price, regardless of weight or distance.', feats: [
      { icon: 'money', title: 'Flat-Rate Pricing', text: 'One price for each box size regardless of weight or destination within the contiguous United States.' },
      { icon: 'box', title: 'Free Boxes', text: 'FedEx One Rate boxes are provided free of charge and available at FedEx locations and online.' },
      { icon: 'check', title: '2-Day Delivery', text: 'All FedEx One Rate shipments deliver in 2 business days or less for fast, predictable service.' }
    ]},
    'holiday-deadlines': { sub: 'Know your last days to ship for holiday delivery.', ov: 'Plan ahead for the holidays with FedEx shipping deadlines. Our guide helps you determine the last recommended shipping dates to ensure delivery by Christmas and other holidays.', feats: [
      { icon: 'calendar', title: 'Shipping Deadlines', text: 'View the last recommended shipping dates for FedEx services to ensure delivery by key holidays.' },
      { icon: 'ship', title: 'Service Options', text: 'Compare transit times across FedEx services to choose the right balance of speed and cost.' },
      { icon: 'alert', title: 'Holiday Schedule', text: 'Check for modified pickup and delivery schedules during the holiday season.' }
    ]},
    'mobile-app': { sub: 'Download the FedEx Mobile app for tracking and shipping on the go.', ov: 'The FedEx Mobile app puts shipping and tracking capabilities right in your pocket. Manage shipments, find locations, and stay informed wherever you are.', feats: [
      { icon: 'phone', title: 'Mobile Tracking', text: 'Track packages in real time with push notifications for status changes and delivery updates.' },
      { icon: 'location', title: 'Find Locations', text: 'Locate nearby FedEx drop boxes and staffed locations with directions and hours.' },
      { icon: 'ship', title: 'Mobile Shipping', text: 'Create labels, schedule pickups, and manage shipments directly from your mobile device.' }
    ]},
    'tariffs': { sub: 'Understand how US tariffs affect your international shipping.', ov: 'International trade is constantly evolving. FedEx provides the guidance and tools you need to navigate tariff changes and continue shipping across borders with confidence.', feats: [
      { icon: 'globe', title: 'Tariff Resources', text: 'Stay informed about current US tariff policies and how they impact your international shipments.' },
      { icon: 'document', title: 'Customs Support', text: 'Get expert assistance with customs documentation, classification, and compliance requirements.' },
      { icon: 'shield', title: 'Trade Guidance', text: 'Access tools and insights to help you manage costs and navigate changing trade regulations.' }
    ]},
    'rewards': { sub: 'Earn rewards for every FedEx shipment you send.', ov: 'FedEx Rewards lets you earn points on your shipping activity that can be redeemed for gift cards, merchandise, and more. Every shipment brings you closer to valuable rewards.', feats: [
      { icon: 'star', title: 'Earn Points', text: 'Earn points on every FedEx Express, Ground, and Freight shipment sent through your account.' },
      { icon: 'money', title: 'Redeem Rewards', text: 'Choose from hundreds of gift cards, merchandise items, and shipping discounts for your business.' },
      { icon: 'check', title: 'No Enrollment Fee', text: 'FedEx Rewards is free to join for all FedEx account holders. Start earning from your first shipment.' }
    ]},
    'rate-changes': { sub: 'Stay informed about FedEx rate and surcharge updates.', ov: 'FedEx regularly reviews and adjusts its rates and surcharges to reflect market conditions and operational costs. Stay informed about upcoming changes that may affect your shipping budget.', feats: [
      { icon: 'money', title: 'Rate Updates', text: 'Review annual rate adjustments and changes to base shipping rates for all FedEx services.' },
      { icon: 'document', title: 'Surcharge Changes', text: 'Stay informed about modifications to fuel surcharges, delivery area surcharges, and additional handling fees.' },
      { icon: 'calendar', title: 'Effective Dates', text: 'Track when rate and surcharge changes take effect to plan your shipping budget accordingly.' }
    ]},
    'money-back-guarantee': { sub: 'FedEx money-back guarantee terms and conditions.', ov: 'FedEx stands behind its service commitments with a money-back guarantee. Learn about the terms and conditions that apply when shipments do not meet their scheduled delivery times.', feats: [
      { icon: 'shield', title: 'Guarantee Terms', text: 'Review the specific terms under which a refund or credit may be requested for late deliveries.' },
      { icon: 'document', title: 'Claim Process', text: 'Step-by-step instructions for submitting a money-back guarantee claim on eligible shipments.' },
      { icon: 'clock', title: 'Time Limits', text: 'Understand the timeframes within which claims must be filed to qualify for refund consideration.' }
    ]},
    'rewards-terms': { sub: 'FedEx Rewards program terms, conditions, and details.', ov: 'The FedEx Rewards program is designed to reward our loyal customers. Review the full terms and conditions governing point accumulation, redemption, and program participation.', feats: [
      { icon: 'document', title: 'Program Rules', text: 'Complete terms governing eligibility, point earning, point expiration, and account management.' },
      { icon: 'star', title: 'Redemption Guide', text: 'Details on how to redeem points, available reward categories, and minimum point thresholds.' },
      { icon: 'shield', title: 'Program Changes', text: 'Information about how program terms may be modified and how members will be notified of changes.' }
    ]},
    'about': { sub: 'Learn about FedEx, our history, and our commitment to excellence.', ov: 'FedEx is one of the worlds largest and most trusted shipping companies, connecting people and possibilities through a global network of logistics expertise and innovation.', feats: [
      { icon: 'globe', title: 'Global Network', text: 'Operating in over 220 countries and territories with one of the largest air cargo fleets in the world.' },
      { icon: 'people', title: 'Our Team', text: 'More than 500,000 team members worldwide committed to delivering exceptional service every day.' },
      { icon: 'star', title: 'Innovation', text: 'Pioneering logistics technology from the first overnight delivery system to modern AI-powered supply chain solutions.' }
    ]},
    'company-structure': { sub: 'Explore the FedEx portfolio of operating companies.', ov: 'FedEx Corp. is composed of multiple operating companies that work together to provide comprehensive logistics, transportation, and business solutions worldwide.', feats: [
      { icon: 'ship', title: 'FedEx Express', text: 'The worlds largest express transportation company, providing time-definite delivery to over 220 countries.' },
      { icon: 'freight', title: 'FedEx Ground', text: 'North American ground delivery network providing cost-effective, day-definite service for packages.' },
      { icon: 'globe', title: 'FedEx Freight', text: 'Less-than-truckload freight services with fast transit times and comprehensive coverage across North America.' }
    ]},
    'investors': { sub: 'FedEx investor relations, financial information, and shareholder resources.', ov: 'FedEx Corporation (NYSE: FDX) is committed to transparency and providing investors with comprehensive financial information, corporate governance details, and shareholder resources.', feats: [
      { icon: 'money', title: 'Financial Reports', text: 'Access quarterly earnings, annual reports, SEC filings, and financial presentations.' },
      { icon: 'calendar', title: 'Events Calendar', text: 'View upcoming investor events, conference presentations, and earnings call schedules.' },
      { icon: 'people', title: 'Corporate Governance', text: 'Information about board composition, governance principles, and shareholder meeting details.' }
    ]},
    'careers': { sub: 'Explore career opportunities and join the FedEx team.', ov: 'FedEx offers dynamic career opportunities across the globe. Join a team that values innovation, diversity, and commitment to service excellence.', feats: [
      { icon: 'people', title: 'Job Opportunities', text: 'Search open positions across all FedEx operating companies and find your next career move.' },
      { icon: 'star', title: 'Benefits & Culture', text: 'Competitive compensation, comprehensive benefits, and a culture that values diversity and inclusion.' },
      { icon: 'check', title: 'Development Programs', text: 'Training, mentorship, and professional development programs to help you grow your career.' }
    ]},
    'blog': { sub: 'Read the FedEx Blog for shipping tips, news, and stories.', ov: 'The FedEx Blog covers a wide range of topics from shipping tips and small business advice to innovation stories and community impact. Stay informed and inspired.', feats: [
      { icon: 'document', title: 'Shipping Tips', text: 'Practical advice on packaging, shipping strategies, and navigating logistics challenges.' },
      { icon: 'star', title: 'Business Insights', text: 'Stories and strategies from successful businesses that use FedEx to power their growth.' },
      { icon: 'people', title: 'Community Stories', text: 'Learn about FedEx community initiatives, sustainability efforts, and team member achievements.' }
    ]},
    'csr': { sub: 'FedEx commitment to corporate social responsibility and sustainability.', ov: 'FedEx is dedicated to responsible business practices that benefit our communities, protect the environment, and create opportunities for people around the world.', feats: [
      { icon: 'globe', title: 'Environmental Sustainability', text: 'Working toward carbon-neutral operations through fleet modernization, renewable energy, and efficiency.' },
      { icon: 'people', title: 'Community Engagement', text: 'Supporting disaster relief, education, and local communities through FedEx Cares initiatives.' },
      { icon: 'check', title: 'Ethical Practices', text: 'Maintaining the highest standards of business conduct, ethics, and corporate governance.' }
    ]},
    'newsroom': { sub: 'FedEx news, press releases, and media resources.', ov: 'The FedEx Newsroom provides the latest announcements, press releases, media resources, and contact information for members of the press.', feats: [
      { icon: 'document', title: 'Press Releases', text: 'Read the latest FedEx news and official announcements from around the world.' },
      { icon: 'star', title: 'Media Resources', text: 'Download images, executive bios, fact sheets, and other materials for media use.' },
      { icon: 'people', title: 'Media Contacts', text: 'Connect with the FedEx public relations team for interviews and media inquiries.' }
    ]},
    'compatible': { sub: 'Ensure your software and systems are FedEx Compatible.', ov: 'FedEx Compatible helps businesses integrate FedEx shipping capabilities into their existing systems and workflows. Ensure your technology works seamlessly with our network.', feats: [
      { icon: 'check', title: 'Integration Tools', text: 'APIs and web services that enable seamless integration of FedEx shipping into your applications.' },
      { icon: 'star', title: 'Certified Partners', text: 'Work with FedEx Compatible technology partners who have certified their integration with our systems.' },
      { icon: 'document', title: 'Technical Resources', text: 'Documentation, SDKs, and support resources for developers building FedEx-enabled solutions.' }
    ]},
    'developer': { sub: 'FedEx Developer Portal — APIs and tools for shipping integration.', ov: 'The FedEx Developer Portal provides everything developers need to integrate FedEx shipping, tracking, and logistics capabilities into their applications and platforms.', feats: [
      { icon: 'document', title: 'API Documentation', text: 'Comprehensive documentation for FedEx REST APIs covering shipping, tracking, rates, and location services.' },
      { icon: 'check', title: 'Testing Tools', text: 'Sandbox environments and testing tools to develop and validate your integration before going live.' },
      { icon: 'support', title: 'Developer Support', text: 'Technical support and developer community resources to help you build successful integrations.' }
    ]},
    'logistics': { sub: 'Comprehensive logistics solutions from FedEx Logistics.', ov: 'FedEx Logistics provides end-to-end supply chain solutions that help businesses optimize their operations, reduce costs, and improve customer satisfaction.', feats: [
      { icon: 'globe', title: 'Supply Chain Management', text: 'Integrated supply chain solutions including warehousing, inventory management, and order fulfillment.' },
      { icon: 'ship', title: 'Transportation Management', text: 'Multi-modal transportation solutions optimizing cost, speed, and reliability across your network.' },
      { icon: 'star', title: 'Value-Added Services', text: 'Custom packaging, kitting, labeling, and other value-added services to meet your specific needs.' }
    ]},
    'newsletter': { sub: 'Subscribe to FedEx email updates and newsletters.', ov: 'Stay connected with FedEx through our email newsletters. Receive shipping tips, industry insights, and exclusive offers delivered directly to your inbox.', feats: [
      { icon: 'alert', title: 'Shipping Tips', text: 'Regular tips and best practices to help you optimize your shipping operations and save money.' },
      { icon: 'star', title: 'Exclusive Offers', text: 'Be the first to know about promotions, new services, and special offers for subscribers.' },
      { icon: 'document', title: 'Industry Insights', text: 'Stay informed about logistics trends, regulatory changes, and innovations in the shipping industry.' }
    ]},
    'sitemap': { sub: 'Navigate all FedEx website pages and resources.', ov: 'The FedEx sitemap provides a complete overview of all pages and resources available on our website. Use this directory to quickly find the information you need.', feats: [
      { icon: 'globe', title: 'Shipping Services', text: 'Browse all shipping solutions including Express, Ground, Freight, and International services.' },
      { icon: 'support', title: 'Customer Support', text: 'Find help resources, contact information, FAQs, and support tools in one convenient location.' },
      { icon: 'check', title: 'Quick Links', text: 'Access the most commonly used FedEx tools and resources from a single directory page.' }
    ]},
    'terms': { sub: 'FedEx Terms of Use — rules and guidelines for website usage.', ov: 'The following terms and conditions govern your use of the FedEx website and services. Please review them carefully before accessing or using any FedEx online resources.', feats: [
      { icon: 'shield', title: 'Acceptance of Terms', text: 'By using this website, you agree to be bound by these terms of use and all applicable laws and regulations.' },
      { icon: 'document', title: 'Use Restrictions', text: 'Guidelines governing appropriate use of FedEx websites, content, and intellectual property.' },
      { icon: 'star', title: 'Service Terms', text: 'Terms and conditions specific to FedEx shipping services and account management.' }
    ]},
    'trust-center': { sub: 'FedEx Privacy & Security — how we protect your information.', ov: 'FedEx is committed to protecting your privacy and maintaining the security of your personal information. Learn about our data practices, security measures, and your rights.', feats: [
      { icon: 'shield', title: 'Privacy Policy', text: 'How FedEx collects, uses, and protects your personal information across our services.' },
      { icon: 'check', title: 'Data Security', text: 'The technical and organizational measures we employ to safeguard your information.' },
      { icon: 'people', title: 'Your Rights', text: 'Information about your privacy rights and how to exercise them regarding your personal data.' }
    ]},
    'ad-choices': { sub: 'FedEx advertising choices and preferences.', ov: 'FedEx uses cookies and similar technologies to deliver relevant advertising. Learn about your options for controlling how your data is used for advertising purposes.', feats: [
      { icon: 'shield', title: 'Interest-Based Ads', text: 'Information about how FedEx uses browsing data to deliver relevant advertisements to you.' },
      { icon: 'check', title: 'Your Choices', text: 'Options for opting out of interest-based advertising from FedEx and our advertising partners.' },
      { icon: 'document', title: 'Cookie Policy', text: 'Details about the cookies and tracking technologies used on FedEx websites and how to manage them.' }
    ]},
    'espanol': { sub: 'FedEx en espanol — todas sus soluciones de envio en un solo lugar.', ov: 'FedEx ofrece una amplia gama de servicios de envio para satisfacer las necesidades de empresas y particulares. Desde entregas urgentes hasta envios economicos, tenemos la solucion para usted.', feats: [
      { icon: 'globe', title: 'Envios Internacionales', text: 'Expand su alcance con nuestra red global de envios que cubre mas de 220 paises y territorios.' },
      { icon: 'track', title: 'Seguimiento', text: 'Monitoree sus paquetes en tiempo real con actualizaciones detalladas y notificaciones de entrega.' },
      { icon: 'location', title: 'Ubicaciones', text: 'Encuentre centros de envio FedEx cercanos con horarios extendidos y servicios completos.' }
    ]}
  };

  const p = profiles[id];
  if (!p) {
    return '<div class="fxg-page-inner"><div class="fxg-subpage-hero"><div class="fxg-subpage-hero__bg"></div><div class="fxg-subpage-hero__content"><h1>' + title + '</h1><p>Welcome to the ' + title + ' page.</p></div></div><div class="fxg-subpage-section"><p>Content coming soon.</p></div></div>';
  }

  let features = '';
  if (p.feats) {
    const iconsList = p.feats.map(function(f) {
      return '<div class="fxg-subpage-feature"><div class="fxg-subpage-feature__icon">' + icon(f.icon) + '</div><h3>' + f.title + '</h3><p>' + f.text + '</p></div>';
    }).join('');
    features = '<div class="fxg-subpage-features">' + iconsList + '</div>';
  }

  return '<div class="fxg-page-inner">' +
    '<div class="fxg-subpage-hero"><div class="fxg-subpage-hero__bg"></div><div class="fxg-subpage-hero__content"><h1>' + title + '</h1><p>' + p.sub + '</p></div></div>' +
    '<div class="fxg-subpage-section"><h2>Overview</h2><p>' + p.ov + '</p></div>' +
    features +
    '</div>';
}

console.log('=== Generating page content ===\n');
for (const entry of manifest) {
  const html = pageContent(entry.id, entry.title);
  fs.writeFileSync(path.join(CONTENT_DIR, entry.id + '.html'), html, 'utf-8');
  console.log('  [' + entry.id + '] ' + (html.length / 1024).toFixed(1) + ' KB');
}
console.log('\n=== Generated ' + manifest.length + ' pages ===');
