export const orders = [
  {
    id: '1',
    orderNumber: '#5678',
    restaurantName: 'China Bistro',
    restaurantAddress: 'Dubai Mall, Downtown',
    customerAddress: 'Burj Residences, Tower 1, Apt 504',
    pickupTime: '2:30 PM',
    status: 'assigned',
    restaurantLogo: '🥡',
    // Dubai Mall (pickup)
    pickupLatitude: 25.1975,
    pickupLongitude: 55.2792,
    // Burj Residences / Downtown area (delivery)
    deliveryLatitude: 25.1980,
    deliveryLongitude: 55.2720,
  },
  {
    id: '2',
    orderNumber: '#5679',
    restaurantName: 'Pizza Paradise',
    restaurantAddress: 'Marina Walk, Dubai Marina',
    customerAddress: 'JBR Beach Residence, Block A',
    pickupTime: '3:00 PM',
    status: 'pending',
    restaurantLogo: '🍕',
    // Marina Walk / Dubai Marina center
    pickupLatitude: 25.0850,
    pickupLongitude: 55.1460,
    // JBR / The Walk area
    deliveryLatitude: 25.0740,
    deliveryLongitude: 55.1400,
  },
  {
    id: '3',
    orderNumber: '#5680',
    restaurantName: 'Burger House',
    restaurantAddress: 'Business Bay, Bay Square',
    customerAddress: 'Executive Towers, Tower H',
    pickupTime: '1:45 PM',
    status: 'completed',
    deliveryTime: '2:15 PM',
    restaurantLogo: '🍔',
    // Business Bay / Bay Square area
    pickupLatitude: 25.1850,
    pickupLongitude: 55.2780,
    // Executive Towers / Business Bay
    deliveryLatitude: 25.1870,
    deliveryLongitude: 55.2650,
  },
  {
    id: '4',
    orderNumber: '#5681',
    restaurantName: 'Sushi Express',
    restaurantAddress: 'DIFC, Gate Avenue',
    customerAddress: 'Emirates Towers, Office 2401',
    pickupTime: '2:45 PM',
    status: 'pickup_ready',
    restaurantLogo: '🍱',
    // DIFC Gate Avenue
    pickupLatitude: 25.2090,
    pickupLongitude: 55.2780,
    // Emirates Towers / DIFC area
    deliveryLatitude: 25.2115,
    deliveryLongitude: 55.2750,
  },
];