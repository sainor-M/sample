# VOLTIX Online Gadget Store — Professional Technology Retail Demo

## Design update
- Technology-only catalog styling with a professional dark retail layout and lime accent.
- Responsive product cards, product photography, improved hero section, and cleaner controls.
- Products remain sample listings; product photos load from Unsplash and require an internet connection.

## Run the system
1. Extract `VOLTIX_System.zip`.
2. Open the `VOLTIX_System` folder.
3. Double-click `index.html` to open it in a modern browser.
4. No installation or server is required for this demonstration.

## Sample administrator account
- Username: `admin`
- Password: `VoltixAdmin123!`
- Click **Login**, enter the credentials, and open **Admin Dashboard**.

## Customer use
1. Click Login → Register to create a customer account.
2. Browse products, use search/category/sort, and add products to the cart.
3. Open Cart → Continue to checkout.
4. Enter sample delivery details and place the demo order.
5. Open **My Orders** to view the order and its current status.

## Admin use
- Add products using the Add a product form.
- Delete demo product listings.
- View submitted orders and change status to:
  - Order Placed
  - To Ship
  - To Receive
  - Completed / Received
  - Cancelled

## Important limitations
- This is a front-end classroom prototype. Products, demo customer accounts, and orders are saved in browser `localStorage` on the same browser/device.
- The admin credentials are hard-coded for demonstration. Do not deploy this as-is or use it for real customers.
- Customer passwords are stored in local browser data for demo purposes. A real deployment must use a secure server backend, password hashing, authorization checks, and a database.
- Payment choices are UI selections only. No payment is processed.
- Order statuses are updated manually by the admin. There is no GPS, map, courier integration, or live order-location tracking.
- Clearing browser storage may erase the demo data.
