const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchasync = require("./../Utils/catchAsync");
const Tour = require("./../Models/tourModel");
const User = require("./../Models/userModel");
const Booking = require("./../Models/bookingModel");
const factory = require("./handlerFactory");


exports.getCheckOutSession = catchasync(async (req, res, next) => {
    // use secret key for backend stripe integration and public key frontend intergration
    // 1 get the tour data
    const tour = await Tour.findById(req.params.tourId);

    // 2 create the session using stripe
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],   // ← correct this line
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                        ],
                    },
                },
                quantity: 1,
            },
        ],
    });

    // 3 send the create session as resp to frontend
    res.status(200).json({
        status: "Sucess",
        session
    })
});

// this not secure way of creating booking to db, temporaray way, later will be done using stripe webhooks once it is deployed
// exports.createBookingCheckout = catchasync(async (req, res, next) => {
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();
//     await Booking.create({
//         tour,
//         user,
//         price
//     });
//     res.redirect(req.originalUrl.split("?")[0]);
// });

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({
        email: session.customer_email
    })).id;
    const price = line_items[0].price_data.unit_amount / 100;
    await Booking.create({
        tour,
        user,
        price
    });
}
exports.stripeCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        res.status(400).send(`Webhook error: ${err.message}`)
    }
    if (event.type === "checkout.session.completed") {
        createBookingCheckout(event.data.object)
    }
    res.status(200).json({
        received: true
    })
}
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

