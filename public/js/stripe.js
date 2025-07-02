/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51RfkcbCv294WKXNor1pHNNBzIUVJBrWJlvHfc1hPDJSk9haVVJwX1Lf2UqjRX5MiClgz0NbynFaUsknhSvW0Lxpy00qxCiiKwC');

const API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://api.mysite.com'
        : '';

export const bookTour = async tourId => {

    try {
        // call the api to get the session
        const session = await axios(`${API_URL}/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session);
        // after getting the create the session and process the payment based on session ID
        await stripe.redirectToCheckout({
            sessionId : session.data.session.id
        })
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
} 